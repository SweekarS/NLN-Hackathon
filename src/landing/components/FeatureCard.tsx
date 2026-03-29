export function FeatureCard({
  icon,
  title,
  description,
  featured = false,
}: {
  icon: string
  title: string
  description: string
  featured?: boolean
}) {
  return (
    <article className={`feature-card${featured ? ' feature-card-featured' : ''}`}>
      <div className="feature-icon-wrap">
        <p className="feature-icon" aria-hidden="true">
          {icon}
        </p>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
