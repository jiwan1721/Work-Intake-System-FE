/**
 * Authored icons, one stroke weight (1.75) and one 16px box, so the family
 * reads as one hand. Kept tiny and local rather than pulling in a library for
 * four glyphs (PLAN §2 lists no icon dependency).
 */

type IconProps = { size?: number }

function Svg({ size = 16, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className="button__icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </Svg>
  )
}

export function PrevIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 2.5L4.5 8l5.5 5.5" />
    </Svg>
  )
}

export function NextIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 2.5L11.5 8 6 13.5" />
    </Svg>
  )
}

/**
 * The FAILED branch leaving the trunk at 45°, drawn at a fixed size so the
 * angle stays exactly 45° at every viewport (the diagram's own rule).
 */
export function BranchLine() {
  return (
    <svg
      width="110"
      height="72"
      viewBox="0 0 110 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
      className="band__diagonal"
    >
      {/* Leaves the trunk at exactly 45°, then runs level into the station.
          The 61px drop clears the trunk stations' own labels, which the
          shorter version collided with. */}
      <path d="M1 1 L61 61 L110 61" />
    </svg>
  )
}
