export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <article className="feature-card">
      <p className="feature-icon" aria-hidden="true">
        {icon}
      </p>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
