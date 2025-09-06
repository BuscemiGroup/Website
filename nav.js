// /nav.js – toegankelijke navigatie met active state & mobiel menu
(() => {
  const qs = (sel, root = document) => root.querySelector(sel)
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel))

  const toggleBtn = qs('[data-nav-toggle]')
  const menu = qs('[data-nav-menu]')
  const links = qsa('[data-nav-link]')
  if (!toggleBtn || !menu) return

  const focusablesSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')

  const isOpen = () => menu.classList.contains('is-open')
  const open = () => {
    menu.classList.add('is-open')
    menu.setAttribute('aria-hidden', 'false')
    toggleBtn.setAttribute('aria-expanded', 'true')
    const first = menu.querySelector(focusablesSelector)
    first && first.focus()
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('click', onDocClick)
  }
  const close = () => {
    menu.classList.remove('is-open')
    menu.setAttribute('aria-hidden', 'true')
    toggleBtn.setAttribute('aria-expanded', 'false')
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('click', onDocClick)
  }
  const toggle = () => (isOpen() ? close() : open())

  const onDocClick = (e) => {
    if (menu.contains(e.target) || toggleBtn.contains(e.target)) return
    close()
  }

  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      close()
      toggleBtn.focus()
      return
    }
    if (e.key === 'Tab' && isOpen()) {
      const focusables = qsa(focusablesSelector, menu)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  // Active link markering (“/”, “/index.html” en subpagina’s)
  const markActive = () => {
    const path = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/'
    links.forEach((a) => {
      const href = a.getAttribute('href') || ''
      const normHref =
        href.replace(/^https?:\/\/[^/]+/i, '').replace(/index\.html$/, '').replace(/\/$/, '') || '/'
      if (normHref === path) {
        a.classList.add('is-active')
        a.setAttribute('aria-current', 'page')
      } else {
        a.classList.remove('is-active')
        a.removeAttribute('aria-current')
      }
    })
  }

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault()
    toggle()
  })
  toggleBtn.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  })

  // Klikken op link sluit menu (mobiel)
  links.forEach((a) => a.addEventListener('click', () => close()))

  // Smooth scroll voor same-page anchors (optioneel)
  links.forEach((a) => {
    const href = a.getAttribute('href') || ''
    if (href.startsWith('#')) {
      a.addEventListener('click', (e) => {
        const el = qs(href)
        if (!el) return
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  })

  window.addEventListener('DOMContentLoaded', markActive)
  window.addEventListener('popstate', markActive)
  window.addEventListener('hashchange', markActive)
  markActive()
})()
