import type { SVGProps } from 'react'

/**
 * EMVY — primary mark.
 * MV monogram with a V cutout. Single-color, currentColor, no gradients.
 * Lives at /brand/mv-mark.svg; this component is the inline equivalent
 * for use in tight React contexts (header, inline links).
 */
export default function EmvyLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="EMVY"
      role="img"
      {...props}
    >
      <path
        d="M 16 30 H 184 V 170 H 16 Z M 52 30 L 148 30 L 100 150 Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  )
}
