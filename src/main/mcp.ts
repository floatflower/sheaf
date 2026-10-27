import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { timingSafeEqual } from 'node:crypto'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
import type { McpSettings } from './settings'
import { t } from './i18n'
import {
  FileToolError,
  appendSuffix,
  appendToDocument,
  createDocument,
  editDocument,
  listDocuments,
  readDocument,
  resolveDocument,
  searchDocuments
} from './mcpFiles'

/** Ask the editor window to do something; resolves with its answer or rejects with its error. */
export type CallRenderer = (method: string, args?: unknown) => Promise<unknown>

export interface McpStatus {
  running: boolean
  port: number
  error?: string
}

const MAX_BODY = 1024 * 1024

const text = (value: unknown): { content: { type: 'text'; text: string }[] } => ({
  content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }]
})

const failure = (message: string): { isError: true; content: { type: 'text'; text: string }[] } => ({
  isError: true,
  content: [{ type: 'text', text: message }]
})

const safeEqual = (a: string, b: string): boolean => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** A fresh server per request (stateless mode): the editor is the only state there is. */
function buildServer(settings: () => McpSettings, call: CallRenderer, workspaceRoot: () => string | null): McpServer {
  const server = new McpServer({ name: 'sheaf', version: '0.1.0' })

  // Run a renderer call and turn its failure into a tool error the model can read and react to.
  const run = async (method: string, args?: unknown): Promise<ReturnType<typeof text> | ReturnType<typeof failure>> => {
    try {
      return text(await call(method, args))
    } catch (err) {
      return failure(err instanceof Error ? err.message : String(err))
    }
  }
  const needsWrite = (): ReturnType<typeof failure> | null =>
    settings().allowWrite ? null : failure(t('mcp.writeDenied', { menu: `${t('menu.edit')} → ${t('settings.title')} → ${t('settings.tabs.ai')}`, item: t('settings.ai.allowWrite') }))

  server.registerTool(
    'get_syntax_guide',
    {
      title: '取得語法指南',
      description:
        '回傳這個編輯器支援的 Markdown 語法，包含自訂區塊（提示框、圖表、數學公式、mermaid、換頁符等）的正確寫法。寫入文件之前先呼叫一次。',
      annotations: { readOnlyHint: true }
    },
    () => run('get_syntax_guide')
  )

  server.registerTool(
    'get_document',
    {
      title: '讀取目前文件',
      description: '回傳使用者正在編輯的文件：檔名、路徑、是否有未儲存變更、完整內容，以及游標位置與選取的文字。',
      annotations: { readOnlyHint: true }
    },
    () => run('get_document')
  )

  server.registerTool(
    'get_render_errors',
    {
      title: '取得渲染錯誤',
      description:
        '等預覽渲染完成後，回傳目前文件裡渲染失敗的區塊（圖表設定錯誤、mermaid 語法錯誤、LaTeX 公式錯誤），含錯誤訊息與原始內容。修改文件後呼叫它來檢查結果。',
      annotations: { readOnlyHint: true }
    },
    () => run('get_render_errors')
  )

  server.registerTool(
    'replace_text',
    {
      title: '取代文字',
      description:
        '在文件中把 find 這段文字換成 replace。find 必須與文件內容逐字相同；預設要求只出現一次，出現多次會回傳錯誤與次數，請加長 find 讓它唯一，或設 replaceAll。整個動作在編輯器裡是一次可還原的操作。除非使用者開啟「直接寫入」，修改會以差異比較顯示，讓使用者逐行接受或拒絕，所以請讓每次修改專注、範圍小。',
      inputSchema: {
        find: z.string().min(1).describe('要被取代的原文，逐字相同'),
        replace: z.string().describe('取代後的文字，可為空字串（等於刪除）'),
        replaceAll: z.boolean().optional().describe('是否取代所有出現的位置，預設 false')
      },
      annotations: { destructiveHint: true, idempotentHint: false }
    },
    async (args) => needsWrite() ?? run('replace_text', { ...args, review: !settings().directWrite })
  )

  server.registerTool(
    'insert_text',
    {
      title: '插入文字',
      description:
        '在文件的游標處、開頭或結尾插入文字。整個動作在編輯器裡是一次可還原的操作。區塊（標題、表格、圖表等）前後請自行帶上空行。除非使用者開啟「直接寫入」，修改會以差異比較顯示，讓使用者逐行接受或拒絕。',
      inputSchema: {
        text: z.string().min(1).describe('要插入的文字'),
        position: z.enum(['cursor', 'start', 'end']).describe('插入位置')
      },
      annotations: { destructiveHint: false, idempotentHint: false }
    },
    async (args) => needsWrite() ?? run('insert_text', { ...args, review: !settings().directWrite })
  )

  // --- files in the open folder ----------------------------------------------------------------
  interface TabStatus {
    open: boolean
    active: boolean
    dirty: boolean
    content: string
  }
  const tabStatus = (path: string): Promise<TabStatus> => call('tab_status', { path }) as Promise<TabStatus>
  const BUSY = '這個檔案已在編輯器的另一個分頁開啟。請先呼叫 open_document 切換到它，或請使用者把它關掉。'

  // Resolve the folder, run `work`, and turn any file problem into a tool error the model can read.
  const withFolder = async (work: (root: string) => Promise<unknown>): Promise<ReturnType<typeof text> | ReturnType<typeof failure>> => {
    const root = workspaceRoot()
    if (!root) return failure('目前沒有開啟資料夾。請使用者先在編輯器用「開啟資料夾」打開日誌或筆記所在的資料夾。')
    try {
      return text(await work(root))
    } catch (err) {
      return failure(err instanceof FileToolError || err instanceof Error ? err.message : String(err))
    }
  }

  server.registerTool(
    'list_documents',
    {
      title: '列出文件',
      description:
        '列出使用者目前開啟的資料夾裡的 .md 檔（路徑相對於該資料夾、最近修改的在前），並附上今天的日期與時間。可用 dir 限制子資料夾、glob 篩選（支援 * ** ?，例如 "journal/*.md"）。用它判斷今天的日誌存不存在、日誌放在哪。',
      inputSchema: {
        dir: z.string().optional().describe('只列這個子資料夾，相對於開啟的資料夾'),
        glob: z.string().optional().describe('檔名或相對路徑的樣式，例如 journal/2026-*.md')
      },
      annotations: { readOnlyHint: true }
    },
    (args) =>
      withFolder(async (root) => {
        const now = new Date()
        const pad = (n: number): string => String(n).padStart(2, '0')
        const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
        return { today, time: `${pad(now.getHours())}:${pad(now.getMinutes())}`, ...(await listDocuments(root, args)) }
      })
  )

  server.registerTool(
    'read_document',
    {
      title: '讀取指定文件',
      description: '依路徑讀取資料夾裡任一個 .md 檔（不限於正在編輯的那份）。寫入前先讀，避免重複。如果檔案正開在編輯器裡，回傳的是編輯器中的最新內容。',
      inputSchema: { path: z.string().min(1).describe('相對於開啟資料夾的路徑，例如 journal/2026-10-27.md') },
      annotations: { readOnlyHint: true }
    },
    ({ path }) =>
      withFolder(async (root) => {
        const full = await resolveDocument(root, path)
        const tab = await tabStatus(full)
        if (tab.open) return { path, content: tab.content, dirty: tab.dirty, openInEditor: true }
        return { path, content: (await readDocument(root, path)).content }
      })
  )

  server.registerTool(
    'search_documents',
    {
      title: '搜尋文件',
      description: '在資料夾的所有 .md 檔裡找包含 query 的行（不分大小寫、純文字比對），回傳檔案、行號與該行內容，最多 50 筆。用來回頭查某個決定或主題出現在哪天。',
      inputSchema: {
        query: z.string().min(1).describe('要找的文字'),
        dir: z.string().optional().describe('只搜這個子資料夾，相對於開啟的資料夾')
      },
      annotations: { readOnlyHint: true }
    },
    ({ query, dir }) => withFolder((root) => searchDocuments(root, query, dir))
  )

  server.registerTool(
    'open_document',
    {
      title: '在編輯器開啟文件',
      description: '把指定文件在編輯器裡打開並切換過去。這會改變使用者畫面上看到的內容，只在使用者明確要求（例如「幫我打開 X」）時才用，不要為了寫入而呼叫。',
      inputSchema: { path: z.string().min(1).describe('相對於開啟資料夾的路徑') },
      annotations: { readOnlyHint: false, idempotentHint: true }
    },
    ({ path }) =>
      withFolder(async (root) => {
        const full = await resolveDocument(root, path)
        await readDocument(root, path) // reports a missing file instead of opening nothing
        return call('open_path', { path: full })
      })
  )

  server.registerTool(
    'append_to_document',
    {
      title: '附加到文件',
      description:
        '在指定文件的結尾加一段文字（與前文隔一個空行）；檔案不存在時預設會建立（含需要的子資料夾）。不會切換使用者目前開著的文件，也不動游標。寫日誌時就用它：先 list_documents 取得今天日期與日誌位置，再附加例如 "## 14:30 — 摘要" 的一段。檔案沒開在編輯器時直接寫入磁碟；若它正是使用者目前編輯的文件，則走編輯器（可還原、可逐行審查）。',
      inputSchema: {
        path: z.string().min(1).describe('相對於開啟資料夾的路徑，例如 journal/2026-10-27.md'),
        text: z.string().min(1).describe('要附加的文字'),
        createIfMissing: z.boolean().optional().describe('檔案不存在時是否建立，預設 true')
      },
      annotations: { destructiveHint: false, idempotentHint: false }
    },
    async ({ path, text: addition, createIfMissing }) =>
      needsWrite() ??
      withFolder(async (root) => {
        const full = await resolveDocument(root, path)
        const tab = await tabStatus(full)
        if (tab.open) {
          if (!tab.active) throw new FileToolError(BUSY)
          await call('insert_text', { text: appendSuffix(tab.content, addition), position: 'end', review: !settings().directWrite })
          return { ok: true, path, created: false, viaEditor: true }
        }
        return { ok: true, ...(await appendToDocument(root, path, addition, createIfMissing !== false)), path }
      })
  )

  server.registerTool(
    'create_document',
    {
      title: '建立文件',
      description: '在資料夾裡建立新的 .md 檔（含需要的子資料夾）。檔案已存在時預設回傳錯誤，要覆寫請設 overwrite。只是要加內容到既有檔案，請用 append_to_document 或 edit_document。',
      inputSchema: {
        path: z.string().min(1).describe('相對於開啟資料夾的路徑'),
        content: z.string().describe('檔案內容'),
        overwrite: z.boolean().optional().describe('已存在時是否覆寫，預設 false')
      },
      annotations: { destructiveHint: true, idempotentHint: false }
    },
    async ({ path, content, overwrite }) =>
      needsWrite() ??
      withFolder(async (root) => {
        const full = await resolveDocument(root, path)
        if ((await tabStatus(full)).open) throw new FileToolError('這個檔案已在編輯器開啟，不能用建立來覆蓋；請改用 edit_document。')
        return { ok: true, ...(await createDocument(root, path, content, overwrite === true)), path }
      })
  )

  server.registerTool(
    'edit_document',
    {
      title: '編輯指定文件',
      description:
        '在指定文件中把 find 換成 replace，規則與 replace_text 相同（find 必須逐字相同；預設只能出現一次，多處要設 replaceAll）。檔案沒開在編輯器時直接寫入磁碟；若它正是使用者目前編輯的文件，則走編輯器（可還原、可逐行審查）。',
      inputSchema: {
        path: z.string().min(1).describe('相對於開啟資料夾的路徑'),
        find: z.string().min(1).describe('要被取代的原文，逐字相同'),
        replace: z.string().describe('取代後的文字，可為空字串'),
        replaceAll: z.boolean().optional().describe('是否取代所有出現的位置，預設 false')
      },
      annotations: { destructiveHint: true, idempotentHint: false }
    },
    async ({ path, find, replace, replaceAll }) =>
      needsWrite() ??
      withFolder(async (root) => {
        const full = await resolveDocument(root, path)
        const tab = await tabStatus(full)
        if (tab.open) {
          if (!tab.active) throw new FileToolError(BUSY)
          return call('replace_text', { find, replace, replaceAll, review: !settings().directWrite })
        }
        return { ok: true, ...(await editDocument(root, path, find, replace, replaceAll === true)), path }
      })
  )

  return server
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(new Error('request too large'))
        req.destroy()
      } else {
        chunks.push(chunk)
      }
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')))
      } catch {
        reject(new Error('invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function reply(res: ServerResponse, status: number, message: string, headers: Record<string, string> = {}): void {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers })
  res.end(message)
}

export class McpController {
  private http: Server | null = null
  status: McpStatus = { running: false, port: 0 }

  constructor(
    private settings: () => McpSettings,
    private call: CallRenderer,
    private workspaceRoot: () => string | null
  ) {}

  async start(): Promise<void> {
    await this.stop()
    const { port } = this.settings()
    const server = createServer((req, res) => void this.handle(req, res, port))
    try {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject)
        // Loopback only: nothing outside this machine can reach it.
        server.listen(port, '127.0.0.1', () => resolve())
      })
      this.http = server
      this.status = { running: true, port }
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code
      this.status = {
        running: false,
        port,
        error: code === 'EADDRINUSE' ? `連接埠 ${port} 已被占用` : err instanceof Error ? err.message : String(err)
      }
    }
  }

  async stop(): Promise<void> {
    const server = this.http
    this.http = null
    this.status = { running: false, port: this.settings().port }
    if (server) {
      server.closeAllConnections()
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  }

  private async handle(req: IncomingMessage, res: ServerResponse, port: number): Promise<void> {
    try {
      if (new URL(req.url ?? '/', 'http://localhost').pathname !== '/mcp') return reply(res, 404, 'Not found')

      // A web page can make the browser call 127.0.0.1 too. Browsers always send Origin and a
      // matching Host is required, so both cases are rejected before the token is even looked at.
      const host = req.headers.host ?? ''
      if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return reply(res, 403, 'Forbidden host')
      if (req.headers.origin) return reply(res, 403, 'Forbidden origin')

      const { token } = this.settings()
      if (!safeEqual(req.headers.authorization ?? '', `Bearer ${token}`)) {
        return reply(res, 401, 'Unauthorized', { 'WWW-Authenticate': 'Bearer' })
      }
      if (req.method !== 'POST') return reply(res, 405, 'Method not allowed', { Allow: 'POST' })

      const body = await readBody(req)
      const server = buildServer(this.settings, this.call, this.workspaceRoot)
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
      res.on('close', () => {
        void transport.close()
        void server.close()
      })
      await server.connect(transport)
      await transport.handleRequest(req, res, body)
    } catch (err) {
      if (!res.headersSent) reply(res, 400, err instanceof Error ? err.message : 'Bad request')
      else res.end()
    }
  }
}
