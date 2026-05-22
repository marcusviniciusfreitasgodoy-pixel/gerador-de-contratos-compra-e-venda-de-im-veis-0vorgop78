import React from 'react'

export function GodoyLogo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/logotipo-negativo-01-8be70.png"
      alt="Godoy Prime Realty Logo"
      className={className}
      {...props}
    />
  )
}

export function GRSymbol({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/gold-f6482.png" alt="GR Symbol" className={className} {...props} />
}
