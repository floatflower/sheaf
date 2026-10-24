import{_ as e,f as t,v as n,y as r}from"./Chrome-BIGD9lkX.js";import{t as i}from"./DocPage-BkO-nDXv.js";var a=r(n(),1),o=e(),s={ui:{title:`自訂`,subtitle:"用主題改變文件的外觀，用插件加入新的語法與行為。主題是一個 `.css` 檔，插件是一個資料夾，放進去就生效，不需要編譯，也不必重新啟動。這一頁的每個範例都實際載入過 app，旁邊的截圖就是它畫出來的結果。",toc:`本頁內容`,result:`渲染結果`,copy:`複製`,copied:`已複製`,back:`回首頁`},sections:[{id:`overview`,title:`檔案放哪裡`,blocks:[{t:`p`,text:`擴充有兩種，各有自己的資料夾：`},{t:`ul`,items:["**主題**：放在主題資料夾的 `.css` 檔，負責預覽、HTML 匯出與 PDF 的外觀。","**插件**：插件資料夾裡的一個子資料夾，裡面有 `metadata.json` 與 `index.js`。它可以加入語法、改寫渲染結果、在頁面裡畫東西，或讓匯出的 HTML 多一個功能。"]},{t:`p`,text:`最快的方式是 **設定 → 外觀 → 開啟外觀資料夾**（插件是 **設定 → 插件 → 開啟插件資料夾**）。新增或修改檔案後，在同一個分頁按 **重新載入**，不需要重新啟動 app。`},{t:`table`,head:[`系統`,`資料夾`],rows:[[`macOS`,"`~/Library/Application Support/Sheaf/themes`，插件是 `…/plugins`"],[`Windows`,"`%APPDATA%\\Sheaf\\themes`，插件是 `…\\plugins`"],[`Linux`,"`~/.config/Sheaf/themes`，插件是 `…/plugins`"]]}]},{id:`theme`,title:`自訂主題`,blocks:[{t:`p`,text:"主題就是一個 CSS 檔。檔名去掉 `.css` 就是它在 設定 → 外觀 裡的名字。所有規則都以 `.markdown-body` 為範圍，它是裝著渲染結果的元素。"},{t:`h`,text:`從完整的檔案開始`},{t:`p`,text:`自訂主題是取代內建外觀，而不是疊在 Default 上面，所以只寫標題樣式的檔案，其他地方就沒有樣式。結構性的規則（間距、清單符號、滿寬表格、換頁）一律會套用，顏色、字體、邊框與背景則全由你的主題決定。最簡單的做法是複製下面的範例，再改成你要的樣子。`},{t:`code`,file:`rose.css`,label:`rose.css`},{t:`image`,src:`customize-theme.png`,alt:`套用 rose 主題的文件：深紅色標題、粉紅色表格邊框，圖表與流程圖也是同一組顏色`},{t:`h`,text:`可以設定的地方`},{t:`table`,head:[`選擇器`,`對象`],rows:[["`.markdown-body`",`整個頁面：文字顏色、背景、字體，以及下面的自訂屬性`],["`h1` … `h6`、`p`、`a`、`blockquote`、`hr`","`.markdown-body` 裡的一般元素"],["`code:not(pre code)`",`行內程式碼，不含程式碼區塊`],["`pre`",`程式碼區塊。語法高亮的顏色見下方`],["`table`、`th`、`td`、`tr`","表格。斑馬紋用 `tbody tr:nth-child(even)`"],["`.callout`、`.callout-note`、`.callout-warning`","`:::note` 與 `:::warning` 區塊。標題文字放在 `data-title` 屬性，由 `::before` 畫出來"],["`figure`、`figcaption`","有圖說的圖片。`figcaption { display: none }` 可以關掉圖說"],["`li.task-list-item`、`.todo-box`",`清單裡的待辦勾選框，以及單獨成行的勾選框`],["`.mermaid-block`、`.chart-block`",`流程圖與圖表的容器。拿來調整間距，顏色請看接下來兩節`]]},{t:`p`,text:"規則在預覽、HTML 匯出與 PDF 裡的效果一致。只想影響列印的部分，寫在 `@media print { … }` 裡。"},{t:`h`,text:`程式碼區塊的顏色`},{t:`p`,text:"程式碼區塊用 Shiki 上色。它會把兩組顏色以 CSS 變數寫在每個字上，分別是 `--shiki-light` 與 `--shiki-dark`，區塊底色則是 `--shiki-light-bg` 與 `--shiki-dark-bg`。預設使用亮色那組；頁面是深色的主題可以改用深色那組："},{t:`code`,code:`.markdown-body .shiki,
.markdown-body .shiki span { color: var(--shiki-dark); }
.markdown-body pre.shiki { background: var(--shiki-dark-bg); }`,label:`CSS`},{t:`h`,text:`字體`},{t:`p`,text:"Noto Sans 與 Noto Serif，包含繁體中文、簡體中文、日文、韓文版本，都內建在 app 裡，所以 `font-family: 'Noto Serif', 'Noto Serif TC', Georgia, serif` 在每一台電腦上看起來都一樣。其他字體必須安裝在閱讀文件的電腦上，匯出時也不會被內嵌。"},{t:`p`,text:"中日韓共用許多漢字，清單裡第一個有這個字的字體就會負責畫它，所以請把你主要寫的語言放在最前面（`TC`、`SC`、`JP`、`KR` 的順序）。"}]},{id:`theme-chart`,title:`設定圖表樣式`,blocks:[{t:`p`,text:"圖表在文件渲染時被畫成圖片，所以 CSS 規則進不到圖表裡面。取而代之的做法是在 `.markdown-body` 上設定自訂屬性，圖表在繪製時會讀取它們。"},{t:`table`,head:[`屬性`,`意義`],rows:[["`--chart-1` … `--chart-8`","依序是各組資料（或圓餅的各個扇形）的顏色。預設值：`#4e79a7`、`#f28e2b`、`#59a14f`、`#e15759`、`#b07aa1`、`#9c755f`、`#76b7b2`、`#bab0ac`。資料組比顏色多時會重複使用"],["`--chart-text`",`標題、座標軸文字與圖例的顏色。預設是頁面的文字顏色`],["`--chart-grid`","格線與邊框的顏色。預設 `rgba(128, 128, 128, 0.3)`"],["`--chart-font`",`圖表文字的字體。預設是頁面的字體`]]},{t:`code`,code:`.markdown-body {
  --chart-1: #e11d48;
  --chart-2: #f59e0b;
  --chart-3: #0d9488;
  --chart-text: #3b2f2f;
  --chart-grid: #fecdd3;
}`,label:`CSS`},{t:`h`,text:`只改某一張圖`},{t:`p`,text:"寫法 B（`chart` 程式碼區塊）接受完整的 Chart.js 設定，所以單張圖表可以使用 Chart.js 支援的任何選項。資料組自己指定了 `backgroundColor` 或 `borderColor` 就以它為準，主題只會替沒有指定顏色的資料組上色。"},{t:`code`,file:`chart-override.md`,label:`chart-override.md`},{t:`p`,text:`設定是 YAML 或 JSON，所以不能寫函式。`}]},{id:`theme-mermaid`,title:`設定 Mermaid 樣式`,blocks:[{t:`p`,text:"流程圖用同樣的概念：`--mermaid-*` 自訂屬性會被當成 Mermaid 的主題變數傳進去。只要設定了其中任何一個，Mermaid 就會切換到可自訂的 `base` 主題，沒設定的變數會依你設定的顏色自動推算。一個都沒設定時，圖就維持 Mermaid 原本的樣子。"},{t:`table`,head:[`屬性`,`意義`],rows:[["`--mermaid-primary`、`-primary-text`、`-primary-border`",`主要節點的填色、文字與邊框。從這裡開始調`],["`--mermaid-secondary…`、`--mermaid-tertiary…`","第二與第三組顏色（各有 `-text` 與 `-border`），用在其他圖種與巢狀的部分"],["`--mermaid-line`",`箭頭與線條`],["`--mermaid-text`",`一般文字顏色`],["`--mermaid-background`",`圖的背景`],["`--mermaid-font`",`字體`],["`--mermaid-node-border`",`節點邊框`],["`--mermaid-cluster-background`、`-cluster-border`",`子圖（subgraph）的方框`],["`--mermaid-note-background`、`-note-text`、`-note-border`",`時序圖裡的備註`],["`--mermaid-edge-label-background`",`箭頭上標籤的底色`],["`--mermaid-dark`","寫 `true`，會使用適合深色頁面的調色"]]},{t:`p`,text:"顏色請寫成 `#ffe4e6` 這樣的十六進位色碼，因為 Mermaid 要從它們推算出需要的色階。"},{t:`code`,code:`.markdown-body {
  --mermaid-primary: #ffe4e6;
  --mermaid-primary-text: #3b2f2f;
  --mermaid-primary-border: #e11d48;
  --mermaid-line: #9f1239;
}`,label:`CSS`}]},{id:`plugin`,title:`自訂插件`,blocks:[{t:`p`,text:"插件是插件資料夾裡的一個**子資料夾**，資料夾名稱就是插件的 id。裡面至少要有兩個檔案：`metadata.json` 說明這個插件，`index.js` 是程式，它是 ES module，**預設匯出（default export）** 一個物件。"},{t:`code`,code:`plugins/
└─ tip/
   ├─ metadata.json
   └─ index.js
`},{t:`p`,text:"函式庫、CSS、圖片等相依的檔案也放在同一個資料夾，插件可以在匯出時讀取它們（見下方的 `exportHtml`）。設定 → 插件 會列出每個插件的名稱、版本與說明，並附上開關（關掉的插件完全不會被載入），載入失敗時也會顯示原因。"},{t:`h`,text:`metadata.json`},{t:`table`,head:[`欄位`,`說明`],rows:[["`name`",`**必填。** 顯示在插件清單裡的名稱`],["`version`","版本，例如 `1.0.0`，會顯示在名稱後面"],["`description`",`一句話說明，顯示在名稱下方`],["`author`、`license`、`homepage`",`作者、授權與網址，目前只是記錄用途`],["`main`","程式檔，相對於插件資料夾，不能指到資料夾之外。預設是 `index.js`"]]},{t:`code`,code:`{
  "name": "Tip box",
  "version": "1.0.0",
  "description": "Adds the :::tip block",
  "author": "you",
  "license": "MIT"
}
`,label:`tip/metadata.json`},{t:`p`,text:"以前直接放在插件資料夾裡的單一 `.js` 檔不再載入，設定 → 插件 會標示它並告訴你要搬進自己的資料夾。"},{t:`h`,text:`index.js 的預設匯出`},{t:`table`,head:[`欄位`,`作用`],rows:[["`directives`","讓 `:::名稱{屬性=值}` 與 `::名稱` 語法產生一個 HTML 元素。每個項目是一個函式，接收 `{ name, kind, attributes }`（`kind` 是 `text`、`leaf` 或 `container`），回傳 `{ tagName, properties }`。區塊裡寫的內容會渲染在這個元素裡面"],["`remarkPlugins`","處理 Markdown 語法樹的插件，使用 unified 的格式：一個函式，或 `[函式, 選項]`"],["`rehypePluginsBeforeHighlight`",`在程式碼上色之前處理 HTML 樹的插件。要接管自己語言的程式碼區塊時用它，內建的 Mermaid 與圖表插件就是這樣做的`],["`rehypePlugins`",`在程式碼上色之後處理 HTML 樹的插件`],["`css`",`字串，或是接收渲染後 HTML、回傳字串的函式，沒用到時可以不輸出樣式。它排在主題 CSS 之前，所以主題可以覆蓋它`],["`postRender`","`(root, { themeCss, target }) => void | Promise`，在預覽、HTML 匯出與 PDF 的渲染結果上執行。用來在預留位置畫東西，或調整 DOM。`target` 是 `preview`、`html`、`html-bundle` 或 `pdf`，可以用來只在某些輸出做事"],["`exportHtml`","`(ctx) => { head, styles, scripts } | Promise`，**只有在匯出 HTML 時**才會被呼叫，用來替匯出的網頁加上樣式與 script。見下方的說明"],["`docs`",`說明你這個語法的 Markdown。它會附加在 AI 助理透過 MCP 取得的語法說明裡，讓助理知道怎麼寫`]]},{t:`h`,text:`範例一：新的語法`},{t:`p`,text:'這個插件新增 `:::tip{title="…"}`。`properties` 要用 HTML 屬性的寫法：`className`，以及 `dataTitle`，它會變成屬性 `data-title`。'},{t:`code`,file:`tip.js`,label:`tip/index.js`},{t:`h`,text:`範例二：改寫 HTML`},{t:`p`,text:"rehype 插件是一個「回傳函式的函式」，回傳的函式會收到語法樹並直接修改它。插件是以獨立模組載入的，所以不能 `import` 套件名稱或其他檔案，走訪語法樹得自己寫，大約十行就夠。"},{t:`code`,file:`external-links.js`,label:`external-links/index.js`},{t:`h`,text:`範例三：畫面渲染完成之後`},{t:`p`,text:"`postRender` 會拿到渲染好的元素，DOM 能做的事它都能做。這個範例在頁面最上方加上閱讀時間，預覽和匯出都看得到。"},{t:`code`,file:`reading-time.js`,label:`reading-time/index.js`},{t:`image`,src:`customize-plugins.png`,alt:`三個插件同時運作的文件：最上方的閱讀時間、外部連結後面的箭頭，以及綠色的提示方塊`},{t:`h`,text:`只在 HTML 匯出時執行：exportHtml`},{t:`p`,text:"想讓匯出的網頁多一個功能，例如點圖放大、目錄、搜尋，就用 `exportHtml`。它只會在 **HTML（內嵌）** 與 **HTML（打包）** 匯出時被呼叫，預覽與 PDF 不會，所以不必自己判斷。它收到一個 `ctx`："},{t:`table`,head:[`欄位`,`說明`],rows:[["`target`","`html`（單一檔案）或 `html-bundle`（圖片、字體與插件檔案放進旁邊的資料夾）"],["`themeCss`",`目前主題的 CSS 文字`],["`readAsset(path)`","讀取插件資料夾裡的文字檔，回傳字串。路徑相對於插件資料夾，不能用 `..` 或絕對路徑"],["`readAssetBytes(path)`","同上，但回傳 `Uint8Array`，用於圖片、字體等二進位檔案"]]},{t:`p`,text:`回傳的物件可以有這些欄位，全部都是選填：`},{t:`table`,head:[`欄位`,`說明`],rows:[["`head`","原樣加進 `<head>` 的 HTML 字串"],["`styles`","`[{ code, file? }]`，樣式表，排在主題 CSS 之後"],["`scripts`",'`[{ code, file?, module? }]`，加在 `</body>` 之前，依陣列順序執行。`module: true` 會用 `type="module"`']]},{t:`p`,text:"`file` 決定它在兩種匯出裡的樣子：**內嵌**匯出一律把 `code` 直接放進頁面，維持單一檔案；**打包**匯出遇到有 `file` 的項目，會寫成 `<名稱>_files/plugins/<插件 id>/<file>`，再用 `<link>` 或 `<script src>` 連結，大型的函式庫就不會塞滿 HTML。所以同一份程式碼兩種模式都能運作，不用寫兩套。沒有 `file` 的項目永遠內嵌。"},{t:`h`,text:`範例四：點圖片放大的燈箱`},{t:`p`,text:`這個插件用 Swiper 讓讀者點擊匯出頁面裡的任何一張圖，就能左右切換整頁的圖片。Sheaf 是離線軟體，所以 Swiper 與你自己的程式都放在插件資料夾裡，不要在匯出的頁面裡引用 CDN。`},{t:`code`,code:`export default {
  // Runs only for the Embedded and Bundle HTML exports; the preview and the PDF skip it.
  exportHtml: async ({ readAsset }) => ({
    styles: [
      { code: await readAsset('swiper-bundle.min.css'), file: 'swiper-bundle.min.css' },
      { code: await readAsset('viewer.css'), file: 'viewer.css' }
    ],
    scripts: [
      { code: await readAsset('swiper-bundle.min.js'), file: 'swiper-bundle.min.js' },
      { code: await readAsset('init.js'), file: 'init.js' }
    ]
  })
}
`,label:`photo-viewer/index.js`},{t:`code`,code:`plugins/
└─ photo-viewer/
   ├─ metadata.json
   ├─ index.js            ← the code above
   ├─ init.js             ← your code: builds the viewer from the page's images
   ├─ viewer.css          ← its styles
   ├─ swiper-bundle.min.js
   └─ swiper-bundle.min.css
`},{t:`p`,text:"如果 `exportHtml` 丟出錯誤，或讀不到檔案，匯出會停下來，跳出視窗告訴你是哪個插件，並提供把錯誤存成 .txt 的按鈕。匯出頁面裡的 script 是在讀者的瀏覽器裡執行，不是在 app 裡。"},{t:`h`,text:`安裝與移除`},{t:`ul`,items:[`把整個插件資料夾放進插件資料夾，到 設定 → 插件 按 **重新載入**。`,"載入失敗時，原因會顯示在名稱下方。常見的原因是找不到 `metadata.json`、`metadata.json` 不是合法的 JSON 或缺了 `name`、讀不到 `index.js`、語法錯誤，或是漏了 `export default`。",`不想用時，在清單裡把它關掉，或直接刪掉資料夾。`]},{t:`p`,text:`**只安裝你信任的插件。** 插件擁有和編輯器頁面本身相同的能力，包括透過 app 讀取與儲存檔案。`}]}]},c={ui:{title:`Customize`,subtitle:"Change how documents look with a theme, or add new syntax and behavior with a plugin. A theme is one `.css` file and a plugin is one folder; drop it in and it works, with no build step and no restart. Every example on this page was loaded into the app to draw the screenshot next to it.",toc:`On this page`,result:`Rendered result`,copy:`Copy`,copied:`Copied`,back:`Back to home`},sections:[{id:`overview`,title:`Where the files go`,blocks:[{t:`p`,text:`There are two kinds of extension, and each has its own folder:`},{t:`ul`,items:["**Theme**: a `.css` file in the themes folder. It styles the preview, HTML export and PDF.","**Plugin**: a subfolder of the plugins folder with a `metadata.json` and an `index.js`. It adds syntax, rewrites the rendered page, draws things into it, or gives the exported HTML a feature of its own."]},{t:`p`,text:`The quickest way there is **Settings → Appearance → Open themes folder** (or **Settings → Plugins → Open plugins folder**). After you add or change a file, press **Reload** in the same tab. The app does not need to restart.`},{t:`table`,head:[`System`,`Folder`],rows:[[`macOS`,"`~/Library/Application Support/Sheaf/themes` and `…/plugins`"],[`Windows`,"`%APPDATA%\\Sheaf\\themes` and `…\\plugins`"],[`Linux`,"`~/.config/Sheaf/themes` and `…/plugins`"]]}]},{id:`theme`,title:`Custom themes`,blocks:[{t:`p`,text:"A theme is one CSS file. Its name, without `.css`, is what you pick in Settings → Appearance. Everything is scoped to `.markdown-body`, the element that holds the rendered page."},{t:`h`,text:`Start from a complete file`},{t:`p`,text:`A custom theme replaces the built-in look rather than sitting on top of Default, so a file that only styles headings leaves everything else unstyled. The structural rules (spacing, list markers, full-width tables, page breaks) always apply. Colors, fonts, borders and backgrounds come from your theme. The simplest start is to copy the example below and change what you like.`},{t:`code`,file:`rose.css`,label:`rose.css`},{t:`image`,src:`customize-theme.png`,alt:`A document drawn with the rose theme: a dark red heading, pink table borders, and a chart and diagram in the same colors`},{t:`h`,text:`What you can style`},{t:`table`,head:[`Selector`,`What it is`],rows:[["`.markdown-body`",`The page itself: text color, background, font, and the custom properties below`],["`h1` … `h6`, `p`, `a`, `blockquote`, `hr`","Ordinary elements inside `.markdown-body`"],["`code:not(pre code)`",`Inline code, as opposed to code blocks`],["`pre`",`Code blocks. Token colors are covered below`],["`table`, `th`, `td`, `tr`","Tables. Use `tbody tr:nth-child(even)` for zebra stripes"],["`.callout`, `.callout-note`, `.callout-warning`","`:::note` and `:::warning` blocks. The heading text is in the `data-title` attribute, drawn by `::before`"],["`figure`, `figcaption`","Images that have a caption. `figcaption { display: none }` turns captions off"],["`li.task-list-item`, `.todo-box`",`To-do checkboxes in lists, and the standalone ones`],["`.mermaid-block`, `.chart-block`",`Containers for diagrams and charts. Use them for spacing, not colors (see the next two sections)`]]},{t:`p`,text:"A rule works the same in the preview, in HTML export and in PDF. Put print-only changes in `@media print { … }`."},{t:`h`,text:`Code block colors`},{t:`p`,text:"Code blocks are highlighted with Shiki, which writes two sets of colors onto every token as CSS variables, `--shiki-light` and `--shiki-dark`, plus `--shiki-light-bg` and `--shiki-dark-bg` for the block. The light set is used unless you say otherwise. A theme with a dark page can switch to the dark set:"},{t:`code`,code:`.markdown-body .shiki,
.markdown-body .shiki span { color: var(--shiki-dark); }
.markdown-body pre.shiki { background: var(--shiki-dark-bg); }`,label:`CSS`},{t:`h`,text:`Fonts`},{t:`p`,text:"Noto Sans and Noto Serif, with their Traditional Chinese, Simplified Chinese, Japanese and Korean variants, ship with the app. `font-family: 'Noto Serif', 'Noto Serif TC', Georgia, serif` therefore looks the same on every computer. Any other font has to be installed on the computer that reads the document and is not embedded in an export."},{t:`p`,text:"Chinese, Japanese and Korean share many characters, and the first font in the list that has a character draws it. List the language you write in first (`TC`, then `SC`, then `JP`, then `KR`)."}]},{id:`theme-chart`,title:`Styling charts`,blocks:[{t:`p`,text:"Charts are drawn into images while the document renders, so CSS rules cannot reach inside them. Instead a theme sets custom properties on `.markdown-body`, and the chart reads them when it is drawn."},{t:`table`,head:[`Property`,`Meaning`],rows:[["`--chart-1` … `--chart-8`","Colors of the series (or slices), in order. Defaults: `#4e79a7`, `#f28e2b`, `#59a14f`, `#e15759`, `#b07aa1`, `#9c755f`, `#76b7b2`, `#bab0ac`. With more series than colors they repeat"],["`--chart-text`",`Titles, axis labels and legend. Defaults to the page's text color`],["`--chart-grid`","Grid lines and borders. Default `rgba(128, 128, 128, 0.3)`"],["`--chart-font`",`Font family of the chart text. Defaults to the page's font`]]},{t:`code`,code:`.markdown-body {
  --chart-1: #e11d48;
  --chart-2: #f59e0b;
  --chart-3: #0d9488;
  --chart-text: #3b2f2f;
  --chart-grid: #fecdd3;
}`,label:`CSS`},{t:`h`,text:`Overriding one chart`},{t:`p`,text:"Form B (a `chart` code block) takes a full Chart.js configuration, so anything Chart.js supports is available for a single chart. A dataset that sets its own `backgroundColor` or `borderColor` keeps it; the theme only colors datasets that have none."},{t:`code`,file:`chart-override.md`,label:`chart-override.md`},{t:`p`,text:`The configuration is YAML or JSON, so it cannot contain functions.`}]},{id:`theme-mermaid`,title:`Styling Mermaid`,blocks:[{t:`p`,text:"Diagrams use the same idea: `--mermaid-*` custom properties are passed to Mermaid as its theme variables. Setting any one of them switches Mermaid to its customizable `base` theme, and every variable you leave out is worked out from the ones you set. Set none and diagrams keep Mermaid's stock look."},{t:`table`,head:[`Property`,`Meaning`],rows:[["`--mermaid-primary`, `-primary-text`, `-primary-border`",`Fill, text and border of the main nodes. Start here`],["`--mermaid-secondary…`, `--mermaid-tertiary…`","Second and third color families (each with `-text` and `-border`), used by other diagram types and by nested parts"],["`--mermaid-line`",`Arrows and lines`],["`--mermaid-text`",`General text color`],["`--mermaid-background`",`Background of the diagram`],["`--mermaid-font`",`Font family`],["`--mermaid-node-border`",`Border of nodes`],["`--mermaid-cluster-background`, `-cluster-border`",`Subgraph boxes`],["`--mermaid-note-background`, `-note-text`, `-note-border`",`Notes in sequence diagrams`],["`--mermaid-edge-label-background`",`Background behind the labels on arrows`],["`--mermaid-dark`","Write `true` for a diagram palette meant for a dark page"]]},{t:`p`,text:"Write colors as hex codes such as `#ffe4e6`, because Mermaid computes the shades it needs from them."},{t:`code`,code:`.markdown-body {
  --mermaid-primary: #ffe4e6;
  --mermaid-primary-text: #3b2f2f;
  --mermaid-primary-border: #e11d48;
  --mermaid-line: #9f1239;
}`,label:`CSS`}]},{id:`plugin`,title:`Custom plugins`,blocks:[{t:`p`,text:"A plugin is a **subfolder** of the plugins folder, and the folder name is the plugin's id. It needs at least two files: `metadata.json` describes it, and `index.js` is the code, an ES module whose **default export** is an object."},{t:`code`,code:`plugins/
└─ tip/
   ├─ metadata.json
   └─ index.js
`},{t:`p`,text:"Anything the plugin depends on (a library, CSS, images) goes in the same folder, and the plugin can read it while exporting (see `exportHtml` below). Settings → Plugins lists every plugin with its name, version and description and a switch (a switched-off plugin is never loaded), and shows the error if one fails to load."},{t:`h`,text:`metadata.json`},{t:`table`,head:[`Field`,`What it is`],rows:[["`name`",`**Required.** The name shown in the plugin list`],["`version`","A version such as `1.0.0`, shown after the name"],["`description`",`One line, shown under the name`],["`author`, `license`, `homepage`",`Who made it, under which license, and where to find it. For the record only, for now`],["`main`","The code file, relative to the plugin folder and not allowed to point outside it. Defaults to `index.js`"]]},{t:`code`,code:`{
  "name": "Tip box",
  "version": "1.0.0",
  "description": "Adds the :::tip block",
  "author": "you",
  "license": "MIT"
}
`,label:`tip/metadata.json`},{t:`p`,text:"A loose `.js` file in the plugins folder, as plugins used to be, is no longer loaded. Settings → Plugins flags it and tells you to move it into a folder of its own."},{t:`h`,text:`What goes in index.js's default export`},{t:`table`,head:[`Field`,`What it does`],rows:[["`directives`","Gives `:::name{attr=value}` and `::name` syntax an HTML element. Each entry is a function that receives `{ name, kind, attributes }` (`kind` is `text`, `leaf` or `container`) and returns `{ tagName, properties }`. What is written inside the block renders inside that element"],["`remarkPlugins`","Plugins for the Markdown syntax tree, in unified's format: a function, or `[function, options]`"],["`rehypePluginsBeforeHighlight`",`Plugins for the HTML tree that run before code is highlighted. Use this to take over code blocks of your own language, as the built-in Mermaid and chart plugins do`],["`rehypePlugins`",`Plugins for the HTML tree that run after highlighting`],["`css`",`A string, or a function of the rendered HTML that returns one, so the styles can be left out when unused. It comes before the theme's CSS, so a theme can override it`],["`postRender`","`(root, { themeCss, target }) => void | Promise` runs on the rendered page in the preview, in HTML export and in PDF. Use it to draw things into placeholders or adjust the DOM. `target` is `preview`, `html`, `html-bundle` or `pdf`, so you can act on some outputs only"],["`exportHtml`","`(ctx) => { head, styles, scripts } | Promise` is called **only when exporting HTML**, to add styles and scripts to the exported page. See below"],["`docs`",`Markdown that explains your syntax. It is added to the syntax guide an AI assistant receives over MCP, so the assistant knows how to write it`]]},{t:`h`,text:`Example 1: new syntax`},{t:`p`,text:'This plugin adds `:::tip{title="…"}`. In `properties`, use HTML property names: `className`, and `dataTitle`, which becomes the attribute `data-title`.'},{t:`code`,file:`tip.js`,label:`tip/index.js`},{t:`h`,text:`Example 2: rewrite the HTML`},{t:`p`,text:"A rehype plugin is a function that returns a function, which receives the tree and changes it. Plugins are loaded as stand-alone modules, so `import` of package names or other files does not work, and the tree is walked by hand. That takes about ten lines."},{t:`code`,file:`external-links.js`,label:`external-links/index.js`},{t:`h`,text:`Example 3: after the page is drawn`},{t:`p`,text:"`postRender` gets the rendered element and can do anything DOM code can. This one adds a reading time at the top, in the preview and in exports."},{t:`code`,file:`reading-time.js`,label:`reading-time/index.js`},{t:`image`,src:`customize-plugins.png`,alt:`A document with three plugins at work: a reading time at the top, an arrow after the external link, and a green tip box`},{t:`h`,text:`Only in HTML export: exportHtml`},{t:`p`,text:"To give the exported page a feature of its own, such as click-to-zoom images, a table of contents or search, use `exportHtml`. It is called only for **HTML (Embedded)** and **HTML (Bundle)** exports, never for the preview or the PDF, so there is nothing to check yourself. It receives a `ctx`:"},{t:`table`,head:[`Field`,`What it is`],rows:[["`target`","`html` (one file) or `html-bundle` (images, fonts and plugin files go in a folder beside the page)"],["`themeCss`",`The CSS text of the current theme`],["`readAsset(path)`","Reads a text file from the plugin's own folder and returns a string. The path is relative to the plugin folder; `..` and absolute paths are refused"],["`readAssetBytes(path)`","The same, but returns a `Uint8Array`, for images, fonts and other binary files"]]},{t:`p`,text:`The object it returns may have any of these fields, all optional:`},{t:`table`,head:[`Field`,`What it is`],rows:[["`head`","An HTML string added to `<head>` as it is"],["`styles`","`[{ code, file? }]`, stylesheets, placed after the theme's CSS"],["`scripts`",'`[{ code, file?, module? }]`, added before `</body>` and run in array order. `module: true` uses `type="module"`']]},{t:`p`,text:"`file` decides how an item appears in each export. The **Embedded** export always puts `code` into the page, so it stays one file. The **Bundle** export writes an item that has a `file` to `<name>_files/plugins/<plugin id>/<file>` and links it with `<link>` or `<script src>`, so a large library does not fill up the HTML. The same code therefore works in both modes, with no second version. An item without `file` is always inline."},{t:`h`,text:`Example 4: a click-to-zoom lightbox`},{t:`p`,text:`This plugin uses Swiper so a reader can click any image on the exported page and flip through all of the page's images. Sheaf is an offline app, so Swiper and your own code live in the plugin folder, and the exported page should not reach for a CDN.`},{t:`code`,code:`export default {
  // Runs only for the Embedded and Bundle HTML exports; the preview and the PDF skip it.
  exportHtml: async ({ readAsset }) => ({
    styles: [
      { code: await readAsset('swiper-bundle.min.css'), file: 'swiper-bundle.min.css' },
      { code: await readAsset('viewer.css'), file: 'viewer.css' }
    ],
    scripts: [
      { code: await readAsset('swiper-bundle.min.js'), file: 'swiper-bundle.min.js' },
      { code: await readAsset('init.js'), file: 'init.js' }
    ]
  })
}
`,label:`photo-viewer/index.js`},{t:`code`,code:`plugins/
└─ photo-viewer/
   ├─ metadata.json
   ├─ index.js            ← the code above
   ├─ init.js             ← your code: builds the viewer from the page's images
   ├─ viewer.css          ← its styles
   ├─ swiper-bundle.min.js
   └─ swiper-bundle.min.css
`},{t:`p`,text:"If `exportHtml` throws, or a file cannot be read, the export stops and a dialog names the plugin and offers a button that saves the error as a .txt file. Scripts in an exported page run in the reader's browser, not in the app."},{t:`h`,text:`Installing and removing`},{t:`ul`,items:[`Put the whole plugin folder in the plugins folder and press **Reload** in Settings → Plugins.`,"If it fails to load, the reason appears under its name. Common causes are a missing `metadata.json`, a `metadata.json` that is not valid JSON or has no `name`, an `index.js` that cannot be read, a syntax error, or a missing `export default`.",`To stop using one, switch it off in the list or delete its folder.`]},{t:`p`,text:`**Only install plugins you trust.** A plugin runs with the same abilities as the editor's own page, including reading and saving files through the app.`}]}]},l=`\`\`\`chart
type: bar
data:
  labels: [Q1, Q2, Q3]
  datasets:
    - label: Sales
      data: [5, 9, 7]
      backgroundColor: "#0d9488"
      borderRadius: 6
options:
  plugins:
    legend: { display: false }
\`\`\`
`,u=`function markExternalLinks() {
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && /^https?:/.test(node.properties?.href ?? '')) {
      node.properties.className = [...(node.properties.className ?? []), 'external']
    }
    node.children?.forEach(walk)
  }
  return walk
}

export default {
  rehypePlugins: [markExternalLinks],
  css: \`.markdown-body a.external::after { content: ' ↗'; font-size: 0.8em; }\`
}
`,d=`export default {
  postRender(root) {
    const text = [...root.querySelectorAll('p, li, td, h1, h2, h3, h4, h5, h6')].map((el) => el.textContent).join('')
    const minutes = Math.max(1, Math.round(text.replace(/\\s/g, '').length / 500))
    const note = document.createElement('p')
    note.className = 'reading-time'
    note.textContent = \`About \${minutes} min read\`
    note.style.cssText = 'color: #71717a; font-size: 0.85em; margin: 0 0 1em;'
    root.prepend(note)
  }
}
`,f=`/* rose.css: the file name is the theme name. */
.markdown-body {
  color: #3b2f2f;
  background: #fffaf7;
  font-family: 'Noto Serif', 'Noto Serif TC', Georgia, serif;
}
.markdown-body h1, .markdown-body h2 { color: #9f1239; padding-bottom: 0.3em; border-bottom: 1px solid #fecdd3; }
.markdown-body a { color: #be123c; }
.markdown-body blockquote { color: #7f5b5b; border-left: 4px solid #fda4af; }
.markdown-body code:not(pre code) { padding: 0.15em 0.4em; border-radius: 4px; background: #ffe4e6; color: #9f1239; }
.markdown-body pre { background: #fff1f2; }
.markdown-body th, .markdown-body td { border: 1px solid #fecdd3; }
.markdown-body tbody tr:nth-child(even) { background: #fff1f2; }

/* Charts and Mermaid read these custom properties. */
.markdown-body {
  --chart-1: #e11d48;
  --chart-2: #f59e0b;
  --chart-3: #0d9488;
  --chart-4: #7c3aed;
  --chart-text: #3b2f2f;
  --chart-grid: #fecdd3;
  --mermaid-primary: #ffe4e6;
  --mermaid-primary-border: #e11d48;
  --mermaid-primary-text: #3b2f2f;
  --mermaid-line: #9f1239;
}
`,p=`export default {
  directives: {
    tip: ({ attributes }) => ({
      tagName: 'div',
      properties: { className: ['tip'], dataTitle: attributes.title ?? 'Tip' }
    })
  },
  css: \`
.markdown-body .tip { margin: 1em 0; padding: 0.6em 1em; border-left: 4px solid #10b981; border-radius: 4px; background: #ecfdf5; }
.markdown-body .tip::before { content: attr(data-title); display: block; font-weight: 600; color: #047857; }
.markdown-body .tip > :last-child { margin-bottom: 0; }
\`,
  docs: \`
### Tip box
:::tip{title="Heads up"}
Text of the tip. The title attribute is optional.
:::
\`
}
`,m=t(),h={"chart-override.md":l,"external-links.js":u,"reading-time.js":d,"rose.css":f,"tip.js":p},g={"zh-TW":s,en:c};function _(){return(0,m.jsx)(i,{docs:g,files:h,current:`customize`})}var v=window.matchMedia(`(prefers-color-scheme: dark)`),y=()=>{document.documentElement.classList.toggle(`dark`,v.matches)};y(),v.addEventListener(`change`,y);var b=document.getElementById(`root`),x=(0,m.jsx)(a.StrictMode,{children:(0,m.jsx)(_,{})});b.hasChildNodes()?(0,o.hydrateRoot)(b,x):(0,o.createRoot)(b).render(x);