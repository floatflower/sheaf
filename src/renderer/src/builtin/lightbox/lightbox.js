// Runs in the exported page (not in the app): clicking an image opens every image of the page in a Swiper.
;(function () {
  var images = [].slice.call(document.querySelectorAll('.markdown-body img')).filter(function (img) {
    return !img.closest('a')
  })
  if (!images.length) return

  var box = null
  var swiper = null
  var opener = null

  // Swiper 14 expects the arrow to be inside the button; the prev button's CSS turns it around.
  var ARROW =
    '<svg class="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" aria-hidden="true">' +
    '<path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"/></svg>'

  function caption(img) {
    var figure = img.closest('figure')
    var text = figure && figure.querySelector('figcaption')
    return (text ? text.textContent : img.alt) || ''
  }

  function close() {
    if (!box) return
    swiper.destroy(true, true)
    box.remove()
    box = swiper = null
    document.documentElement.style.overflow = ''
    document.removeEventListener('keydown', onKey, true)
    if (opener) opener.focus({ preventScroll: true })
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
    }
  }

  function open(index) {
    opener = document.activeElement
    box = document.createElement('div')
    box.className = 'sheaf-lightbox'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-modal', 'true')
    var slides = images
      .map(function (img) {
        var c = caption(img)
        var slide = document.createElement('div')
        slide.className = 'swiper-slide'
        slide.innerHTML =
          '<div class="swiper-zoom-container"><img alt="" /></div>' + (c ? '<div class="sheaf-lightbox-caption"></div>' : '')
        slide.querySelector('img').src = img.currentSrc || img.src
        slide.querySelector('img').alt = img.alt
        if (c) slide.querySelector('.sheaf-lightbox-caption').textContent = c
        return slide
      })
    box.innerHTML =
      '<div class="swiper"><div class="swiper-wrapper"></div>' +
      '<div class="swiper-button-prev">' + ARROW + '</div><div class="swiper-button-next">' + ARROW + '</div>' +
      '<div class="swiper-pagination"></div></div>' +
      '<button type="button" class="sheaf-lightbox-close" aria-label="Close">×</button>'
    var wrapper = box.querySelector('.swiper-wrapper')
    slides.forEach(function (s) {
      wrapper.appendChild(s)
    })
    document.body.appendChild(box)
    document.documentElement.style.overflow = 'hidden'
    swiper = new Swiper(box.querySelector('.swiper'), {
      initialSlide: index,
      zoom: true,
      keyboard: { enabled: true },
      navigation: { prevEl: box.querySelector('.swiper-button-prev'), nextEl: box.querySelector('.swiper-button-next') },
      pagination: { el: box.querySelector('.swiper-pagination'), type: 'fraction' },
      a11y: true
    })
    box.querySelector('.sheaf-lightbox-close').addEventListener('click', close)
    // A click beside the picture closes it; a click on the picture itself is left for zoom.
    box.addEventListener('click', function (e) {
      var t = e.target
      if (t.classList.contains('swiper-zoom-container') || t.classList.contains('swiper-slide') || t.classList.contains('swiper')) close()
    })
    document.addEventListener('keydown', onKey, true)
    box.querySelector('.sheaf-lightbox-close').focus({ preventScroll: true })
  }

  document.addEventListener('click', function (e) {
    var index = images.indexOf(e.target)
    if (index >= 0 && !box) open(index)
  })
})()
