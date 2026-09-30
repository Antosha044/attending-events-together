import type { ReactNode } from 'react'

export default function PageIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-intro"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action && <div className="intro-action">{action}</div>}</div>
}
