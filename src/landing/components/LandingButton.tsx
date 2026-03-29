import type { AnchorHTMLAttributes, PropsWithChildren } from 'react'

type LandingButtonProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: 'primary' | 'secondary'
  }
>

export function LandingButton({
  children,
  variant = 'primary',
  className,
  ...props
}: LandingButtonProps) {
  return (
    <a className={`landing-btn ${variant}${className ? ` ${className}` : ''}`} {...props}>
      {children}
    </a>
  )
}
