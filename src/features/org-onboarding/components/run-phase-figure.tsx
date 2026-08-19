import { motion } from 'framer-motion'

function draw(order: number) {
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      duration: 0.55,
      delay: 0.15 + order * 0.12,
      ease: 'easeOut' as const,
    },
  }
}

function fade(order: number) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 0.4,
      delay: 0.15 + order * 0.12,
      ease: 'easeOut' as const,
    },
  }
}

function Ping({
  cx,
  cy,
  running,
}: {
  cx: number
  cy: number
  running: boolean
}) {
  if (!running) return null
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={5}
      className="fill-primary/25"
      animate={{ r: [5, 16], opacity: [0.5, 0] }}
      transition={{ duration: 2.4, ease: 'easeOut', repeat: Infinity }}
    />
  )
}

function BranchScene({ running }: { running: boolean }) {
  return (
    <>
      <motion.path d="M24 84 H240" className="stroke-stock" {...draw(0)} />
      <motion.circle
        cx={64}
        cy={84}
        r={3.5}
        className="fill-stock"
        {...fade(1)}
      />
      <motion.circle
        cx={104}
        cy={84}
        r={3.5}
        className="fill-stock"
        {...fade(1)}
      />
      <motion.path
        d="M104 84 C 138 84 142 40 176 40 L 232 40"
        className="stroke-primary"
        {...draw(2)}
      />
      <Ping cx={232} cy={40} running={running} />
      <motion.circle
        cx={232}
        cy={40}
        r={4.5}
        className="fill-primary"
        {...fade(4)}
      />
    </>
  )
}

function MachineScene({ running }: { running: boolean }) {
  return (
    <>
      <motion.rect
        x={76}
        y={26}
        width={128}
        height={68}
        rx={12}
        className="stroke-stock fill-shading"
        {...fade(0)}
      />
      <motion.path d="M76 48 H204" className="stroke-stock" {...draw(1)} />
      <motion.circle
        cx={90}
        cy={37}
        r={2.5}
        className="fill-stock"
        {...fade(1)}
      />
      <motion.circle
        cx={99}
        cy={37}
        r={2.5}
        className="fill-stock"
        {...fade(1)}
      />
      <motion.circle
        cx={108}
        cy={37}
        r={2.5}
        className="fill-stock"
        {...fade(1)}
      />
      <motion.path d="M94 66 H166" className="stroke-primary/60" {...draw(2)} />
      <motion.path d="M94 80 H142" className="stroke-primary/60" {...draw(3)} />
      <Ping cx={188} cy={37} running={running} />
      <motion.circle
        cx={188}
        cy={37}
        r={3}
        className="fill-primary"
        {...fade(2)}
      />
    </>
  )
}

function PackagesScene({ running }: { running: boolean }) {
  return (
    <>
      <motion.path d="M56 98 H224" className="stroke-stock" {...draw(0)} />
      <Ping cx={173} cy={81} running={running} />
      <motion.rect
        x={94}
        y={68}
        width={26}
        height={26}
        rx={8}
        className="stroke-primary/50 fill-primary/10"
        {...fade(1)}
      />
      <motion.rect
        x={127}
        y={68}
        width={26}
        height={26}
        rx={8}
        className="stroke-primary/50 fill-primary/10"
        {...fade(2)}
      />
      <motion.rect
        x={160}
        y={68}
        width={26}
        height={26}
        rx={8}
        className="stroke-primary/50 fill-primary/10"
        {...fade(3)}
      />
    </>
  )
}

const SOURCE_ROWS = [
  { y: 30, width: 54 },
  { y: 45, width: 66 },
  { y: 60, width: 46 },
  { y: 75, width: 60 },
  { y: 90, width: 50 },
]

const SOURCE_LINKS = [
  'M100 32 C 140 32 148 62 178 62',
  'M100 47 C 140 47 152 62 178 62',
  'M100 62 H178',
  'M100 77 C 140 77 152 62 178 62',
  'M100 92 C 140 92 148 62 178 62',
]

function GraphScene({ running }: { running: boolean }) {
  return (
    <>
      {SOURCE_ROWS.map((row, index) => (
        <motion.rect
          key={row.y}
          x={24}
          y={row.y}
          width={row.width}
          height={4}
          rx={2}
          className="fill-stock"
          {...fade(index)}
        />
      ))}
      {SOURCE_LINKS.map((link, index) => (
        <motion.path
          key={link}
          d={link}
          className="stroke-primary/40"
          {...draw(index + 1)}
        />
      ))}
      <Ping cx={182} cy={62} running={running} />
      <motion.circle
        cx={182}
        cy={62}
        r={6}
        className="stroke-primary fill-primary/20"
        {...fade(6)}
      />
      <motion.path
        d="M188 58 L 214 42"
        className="stroke-primary/40"
        {...draw(7)}
      />
      <motion.path
        d="M189 62 H 218"
        className="stroke-primary/40"
        {...draw(7)}
      />
      <motion.path
        d="M188 66 L 214 82"
        className="stroke-primary/40"
        {...draw(7)}
      />
      <motion.circle
        cx={216}
        cy={40}
        r={3.5}
        className="fill-primary"
        {...fade(8)}
      />
      <motion.circle
        cx={222}
        cy={62}
        r={3.5}
        className="fill-primary"
        {...fade(8)}
      />
      <motion.circle
        cx={216}
        cy={84}
        r={3.5}
        className="fill-primary"
        {...fade(8)}
      />
    </>
  )
}

function CommitScene({ running }: { running: boolean }) {
  return (
    <>
      <motion.path d="M28 60 H188" className="stroke-stock" {...draw(0)} />
      <motion.circle
        cx={64}
        cy={60}
        r={3.5}
        className="fill-stock"
        {...fade(1)}
      />
      <motion.circle
        cx={110}
        cy={60}
        r={3.5}
        className="fill-stock"
        {...fade(1)}
      />
      <Ping cx={188} cy={60} running={running} />
      <motion.circle
        cx={188}
        cy={60}
        r={5}
        className="fill-primary"
        {...fade(2)}
      />
      <motion.path
        d="M196 60 H214"
        className="stroke-primary/50"
        {...draw(3)}
      />
      <motion.rect
        x={214}
        y={47}
        width={26}
        height={26}
        rx={8}
        className="stroke-primary/50 fill-primary/10"
        {...fade(4)}
      />
    </>
  )
}

function PublishScene({ running }: { running: boolean }) {
  return (
    <>
      <motion.rect
        x={88}
        y={78}
        width={26}
        height={26}
        rx={8}
        className="stroke-stock fill-shading"
        {...fade(0)}
      />
      <motion.rect
        x={127}
        y={78}
        width={26}
        height={26}
        rx={8}
        className="stroke-stock fill-shading"
        {...fade(0)}
      />
      <motion.rect
        x={166}
        y={78}
        width={26}
        height={26}
        rx={8}
        className="stroke-stock fill-shading"
        {...fade(0)}
      />
      <motion.path
        d="M101 78 C 101 52 116 40 130 34"
        className="stroke-primary/40"
        {...draw(1)}
      />
      <motion.path
        d="M140 78 V 38"
        className="stroke-primary/40"
        {...draw(2)}
      />
      <motion.path
        d="M179 78 C 179 52 164 40 150 34"
        className="stroke-primary/40"
        {...draw(3)}
      />
      <Ping cx={140} cy={26} running={running} />
      <motion.circle
        cx={140}
        cy={26}
        r={9}
        className="stroke-primary fill-primary/15"
        {...fade(4)}
      />
      <motion.circle
        cx={140}
        cy={26}
        r={3}
        className="fill-primary"
        {...fade(5)}
      />
    </>
  )
}

const CHECK_ROWS = [
  { y: 36, end: 192 },
  { y: 60, end: 174 },
  { y: 84, end: 184 },
]

function ChecksScene({ running }: { running: boolean }) {
  return (
    <>
      {CHECK_ROWS.map((row, index) => (
        <motion.circle
          key={`mark-${row.y}`}
          cx={96}
          cy={row.y}
          r={8}
          className="stroke-primary/50 fill-primary/10"
          {...fade(index)}
        />
      ))}
      {CHECK_ROWS.map((row, index) => (
        <motion.path
          key={`check-${row.y}`}
          d={`M92 ${row.y} l3 3.5 l5.5 -7.5`}
          className="stroke-primary"
          {...draw(index + 1)}
        />
      ))}
      {CHECK_ROWS.map((row, index) => (
        <motion.path
          key={`line-${row.y}`}
          d={`M114 ${row.y} H${row.end}`}
          className="stroke-stock"
          {...draw(index + 1)}
        />
      ))}
      <Ping cx={96} cy={84} running={running} />
    </>
  )
}

function FailureScene() {
  return (
    <>
      <motion.path d="M32 60 H112" className="stroke-stock" {...draw(0)} />
      <motion.path
        d="M168 60 H248"
        strokeDasharray="3 5"
        className="stroke-stock"
        {...draw(0)}
      />
      <motion.circle
        cx={140}
        cy={60}
        r={14}
        className="stroke-destructive/50 fill-destructive/10"
        {...fade(1)}
      />
      <motion.path
        d="M134 54 L146 66"
        className="stroke-destructive"
        {...draw(2)}
      />
      <motion.path
        d="M146 54 L134 66"
        className="stroke-destructive"
        {...draw(3)}
      />
    </>
  )
}

function Scene({ index, running }: { index: number; running: boolean }) {
  if (index === 0) return <BranchScene running={running} />
  if (index === 1) return <MachineScene running={running} />
  if (index === 2) return <PackagesScene running={running} />
  if (index === 3) return <GraphScene running={running} />
  if (index === 4) return <CommitScene running={running} />
  if (index === 5) return <PublishScene running={running} />
  if (index === 6) return <ChecksScene running={running} />
  throw new Error(`No figure for run phase ${index}`)
}

export function RunPhaseFigure({
  index,
  running,
  failed,
}: {
  index: number
  running: boolean
  failed: boolean
}) {
  return (
    <svg
      viewBox="0 0 280 120"
      fill="none"
      strokeWidth={1.25}
      strokeLinecap="round"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
    >
      {failed && <FailureScene />}
      {!failed && <Scene index={index} running={running} />}
    </svg>
  )
}
