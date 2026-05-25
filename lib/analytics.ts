type EventPayload = Record<string, string | number | boolean | null | undefined>

export function trackEvent(eventName: string, payload: EventPayload = {}) {
  if (typeof window === 'undefined') return

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ event: eventName, ...payload })
  }

  if (process.env.NODE_ENV !== 'production') {
    // Keep local event visibility during development without requiring an analytics vendor.
    console.debug('[analytics]', eventName, payload)
  }
}
