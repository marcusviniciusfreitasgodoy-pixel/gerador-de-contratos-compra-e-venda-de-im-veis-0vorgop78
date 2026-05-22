import React from 'react'

export function GodoyLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" className={className} {...props}>
      <text
        x="150"
        y="45"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="36"
        fontWeight="300"
        letterSpacing="0.25em"
        textAnchor="middle"
        fill="currentColor"
      >
        GODOY
      </text>
      <text
        x="150"
        y="70"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="400"
        letterSpacing="0.4em"
        textAnchor="middle"
        fill="currentColor"
      >
        PRIME REALTY
      </text>
    </svg>
  )
}
