import type { SVGProps } from 'react'

export default function EmvyLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 88 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="EMVY" {...props}>
      <path
        d="M3.5 19V5h21v4H8.4v2.8h13.1v3.6H8.4V19H24.7v4H3.5Z"
        fill="currentColor"
      />
      <path
        d="M28.8 23V5h6.4l4.8 8.5L44.8 5h6.3v18h-4.7V12.2L40.1 23h-1.1l-6.3-10.8V23h-3.9Z"
        fill="currentColor"
      />
      <path
        d="M53.2 5h5.3l7 11.8L72.5 5h5.3l-10.1 18h-4.3L53.2 5Z"
        fill="currentColor"
      />
      <path d="M80.1 5h4.9l-7.1 11.1V23h-4.5v-6.9L66.4 5h5l4.8 7.6L80.1 5Z" fill="currentColor" />
    </svg>
  )
}
