export function WaveDivider({ flipped = false }: { flipped?: boolean }) {
  return (
    <div className={`wave-wrap${flipped ? ' flipped' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path
          d="M0,70 C200,20 360,120 560,82 C760,44 920,10 1120,52 C1260,82 1350,106 1440,86 L1440,140 L0,140 Z"
          fill="var(--surface-container-high)"
        />
      </svg>
    </div>
  )
}
