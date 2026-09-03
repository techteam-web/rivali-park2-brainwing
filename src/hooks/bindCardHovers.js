import { inlineSvgsReady } from '../lib/gsap'

// Binds each amenity hotspot's hover animation to its inline SVG icon.
//
// The subtlety this exists for: those icons are fetched and injected at runtime
// by <InlineSVG>, so a card's <svg> is not guaranteed to be in the DOM when
// inlineSvgsReady resolves — that helper has a 4s bail-out, and content can land
// after it either way. The original one-shot pass simply skipped any card whose
// icon had not arrived, silently and permanently: the hotspot stayed clickable,
// but its icon never animated on hover and its pill never lit up, which reads
// exactly like a hotspot that was deliberately switched off pending artwork.
//
// So instead of binding once and hoping, keep watching until every card that can
// bind has bound. New artwork dropped in later is picked up on its own, with no
// per-hotspot wiring — which is the point: adding an asset is all it should take.
//
// `setups` is keyed by the card's lowercased name (its `data-card-name`).
// Non-clickable cards are still skipped by design — animating a hotspot with no
// detail page would signal interactivity it does not have.
export function bindCardHovers(root, setups) {
  let cancelled = false
  let queued = 0
  let observer = null
  const cleanups = []
  const bound = new Set()

  // Cards that have both a detail page and an animation defined for them.
  const bindable = () =>
    Array.from(root.querySelectorAll('[data-card-name]')).filter(
      (card) =>
        card.classList.contains('is-clickable') &&
        setups[card.getAttribute('data-card-name')],
    )

  const bind = () => {
    if (cancelled) return
    const cards = bindable()

    cards.forEach((card) => {
      if (bound.has(card)) return
      const svgEl = card.querySelector('svg')
      if (!svgEl) return // icon not injected yet — a later mutation retries
      bound.add(card)
      const cleanup = setups[card.getAttribute('data-card-name')](svgEl)
      if (cleanup) cleanups.push(cleanup)
    })

    // Everything that could bind has. Stop watching.
    if (cards.length && cards.every((card) => bound.has(card))) {
      observer?.disconnect()
    }
  }

  const schedule = () => {
    if (queued || cancelled) return
    queued = requestAnimationFrame(() => {
      queued = 0
      bind()
    })
  }

  observer = new MutationObserver(schedule)
  observer.observe(root, { childList: true, subtree: true })

  inlineSvgsReady(root).then(bind)

  return () => {
    cancelled = true
    observer.disconnect()
    if (queued) cancelAnimationFrame(queued)
    cleanups.forEach((c) => c())
  }
}
