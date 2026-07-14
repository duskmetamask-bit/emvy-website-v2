type EventPayload = Record<string, string | number | boolean | null | undefined>

export function trackEvent(eventName: string, payload: EventPayload = {}) {
  if (typeof window === 'undefined') return

  const eventPayload = { page: window.location.pathname, ...payload }

  const plausible = (window as Window & { plausible?: (event: string, options?: { props: EventPayload }) => void }).plausible
  if (typeof plausible === 'function') {
    plausible(eventName, { props: eventPayload })
  }

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ event: eventName, ...eventPayload })
  }

  if (process.env.NODE_ENV !== 'production') {
    // Keep local event visibility during development without requiring an analytics vendor.
    console.debug('[analytics]', eventName, eventPayload)
  }
}
