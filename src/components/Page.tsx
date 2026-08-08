import type { ReactNode } from 'react'

export function Page({
  title,
  actions,
  children,
}: {
  title: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="page">
      <header className="page__h">
        <h1 className="page__t">{title}</h1>
        <span className="page__r" />
        {actions}
      </header>
      {children}
    </div>
  )
}
