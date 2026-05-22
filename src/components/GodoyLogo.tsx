import React from 'react'

export function GodoyLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" className={className} {...props}>
      <text
        x="150"
        y="45"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="36"
        fontWeight="700"
        letterSpacing="0.15em"
        textAnchor="middle"
        fill="currentColor"
      >
        GODOY
      </text>
      <text
        x="150"
        y="65"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="400"
        letterSpacing="0.4em"
        textAnchor="middle"
        fill="currentColor"
        className="opacity-80"
      >
        PRIME REALTY
      </text>
    </svg>
  )
}

export function GRSymbol({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className={className} {...props}>
      <rect width="40" height="40" rx="8" fill="currentColor" fillOpacity="0.1" />
      <text
        x="20"
        y="26"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="800"
        letterSpacing="0.05em"
        textAnchor="middle"
        fill="currentColor"
      >
        GR
      </text>
    </svg>
  )
}
