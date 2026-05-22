import React from 'react'

export function GodoyLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" className={className} {...props}>
      <g transform="translate(5, 15)">
        <rect width="50" height="50" rx="10" fill="currentColor" fillOpacity="0.15" />
        <text
          x="25"
          y="34"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="900"
          letterSpacing="0.02em"
          textAnchor="middle"
          fill="currentColor"
        >
          GR
        </text>
      </g>
      <text
        x="70"
        y="46"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="32"
        fontWeight="800"
        letterSpacing="0.1em"
        fill="currentColor"
      >
        GODOY
      </text>
      <text
        x="72"
        y="65"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="600"
        letterSpacing="0.32em"
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className={className} {...props}>
      <rect width="50" height="50" rx="10" fill="currentColor" fillOpacity="0.15" />
      <text
        x="25"
        y="34"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="24"
        fontWeight="900"
        letterSpacing="0.02em"
        textAnchor="middle"
        fill="currentColor"
      >
        GR
      </text>
    </svg>
  )
}
