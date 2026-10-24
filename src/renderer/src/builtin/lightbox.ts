import type { MdPlugin } from '@/lib/markdown'
import swiperCss from './lightbox/swiper-bundle.min.css?raw'
import swiperJs from './lightbox/swiper-bundle.min.js?raw'
import lightboxCss from './lightbox/lightbox.css?raw'
import lightboxJs from './lightbox/lightbox.js?raw'

/** Click an image in an exported HTML page to flip through all of the page's images (Swiper). Not in the preview or PDF. */
export const lightboxPlugin: MdPlugin = {
  name: 'Lightbox',
  exportHtml: () => ({
    styles: [
      { code: swiperCss, file: 'swiper-bundle.min.css' },
      { code: lightboxCss, file: 'lightbox.css' }
    ],
    scripts: [
      // The source-map comment would only make a browser look for a file we do not ship.
      { code: swiperJs.replace(/\n?\/\/# sourceMappingURL=.*$/m, ''), file: 'swiper-bundle.min.js' },
      { code: lightboxJs, file: 'lightbox.js' }
    ]
  })
}
