export function SectionHeading({
  kicker,
  title,
}: {
  kicker: string
  title: string
}) {
  return (
    <header className="section-heading">
      <p className="eyebrow">{kicker}</p>
      <h2>{title}</h2>
    </header>
  )
}
