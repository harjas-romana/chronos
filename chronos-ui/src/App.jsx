import { useState, useEffect, useRef } from 'react'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');`

const CSS = `
  ${FONTS}

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --void: #030407;
    --surface: #0b0d14;
    --edge: #13161f;
    --amber: #f5a623;
    --amber-dim: rgba(245,166,35,0.12);
    --cyan: #00e5ff;
    --cyan-dim: rgba(0,229,255,0.1);
    --green: #00ff9d;
    --green-dim: rgba(0,255,157,0.1);
    --red: #ff3b5c;
    --red-dim: rgba(255,59,92,0.1);
    --muted: rgba(255,255,255,0.18);
    --subtle: rgba(255,255,255,0.06);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--void);
    color: #fff;
    font-family: 'JetBrains Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── AMBIENT CANVAS ── */
  .ambient {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    overflow: hidden;
  }
  .orb {
    position: absolute; border-radius: 50%; filter: blur(120px);
    animation: breathe 8s ease-in-out infinite;
  }
  .orb-1 {
    width: 520px; height: 520px;
    background: radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%);
    top: -160px; left: -160px;
    animation-delay: 0s;
  }
  .orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%);
    bottom: -120px; right: -80px;
    animation-delay: -3s;
  }
  .orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(0,255,157,0.04) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%,-50%);
    animation-delay: -5s;
  }
  @keyframes breathe {
    0%, 100% { transform: scale(1) translate(0,0); opacity: 1; }
    33% { transform: scale(1.08) translate(12px,-8px); opacity: 0.7; }
    66% { transform: scale(0.94) translate(-8px,12px); opacity: 0.9; }
  }

  /* Grid texture */
  .grid-texture {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(245,166,35,0.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,166,35,0.028) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  /* Scanline overlay */
  .scanlines {
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.06) 2px,
      rgba(0,0,0,0.06) 4px
    );
  }
  /* Vignette */
  .vignette {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.72) 100%);
  }

  /* ── LAYOUT ── */
  .shell {
    position: relative; z-index: 2;
    max-width: 1100px; margin: 0 auto;
    padding: 0 28px 100px;
  }

  /* ── HERO HEADER ── */
  .hero {
    min-height: 44vh;
    display: flex; flex-direction: column; justify-content: flex-end;
    padding-bottom: 56px;
    position: relative;
  }
  .hero-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.32em;
    color: var(--amber); text-transform: uppercase;
    margin-bottom: 18px;
    opacity: 0; animation: fadeUp 0.7s 0.2s forwards;
    display: flex; align-items: center; gap: 10px;
  }
  .dot-pulse {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--amber);
    animation: pulse-dot 1.8s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.5); opacity: 1; }
    50% { box-shadow: 0 0 0 8px rgba(245,166,35,0); opacity: 0.7; }
  }

  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(3.2rem, 9vw, 6.8rem);
    font-weight: 800;
    line-height: 0.92;
    letter-spacing: -0.03em;
    color: #fff;
    opacity: 0; animation: fadeUp 0.8s 0.35s forwards;
  }
  .hero-title span {
    color: var(--amber);
    display: inline-block;
    animation: glitch-shift 6s steps(1) infinite;
  }
  @keyframes glitch-shift {
    0%, 94%, 100% { text-shadow: none; transform: none; }
    95% { text-shadow: -2px 0 var(--cyan), 2px 0 var(--red); transform: skewX(-1deg); }
    97% { text-shadow: 2px 0 var(--cyan), -2px 0 var(--red); transform: skewX(0.5deg); }
  }

  .hero-meta {
    display: flex; align-items: center; gap: 24px;
    margin-top: 28px;
    opacity: 0; animation: fadeUp 0.7s 0.55s forwards;
  }
  .leader-badge {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 14px;
    border: 1px solid rgba(245,166,35,0.35);
    background: var(--amber-dim);
    border-radius: 3px;
    font-size: 10px; letter-spacing: 0.22em;
    color: var(--amber); text-transform: uppercase;
  }
  .crown-icon { width: 13px; height: 13px; fill: var(--amber); }
  .meta-divider { width: 1px; height: 28px; background: var(--subtle); }
  .meta-stat {
    display: flex; flex-direction: column; gap: 2px;
    font-size: 10px; color: var(--muted); letter-spacing: 0.15em;
  }
  .meta-stat strong { color: #fff; font-size: 18px; letter-spacing: -0.02em; font-weight: 500; }

  .hero-line {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--amber), transparent);
    opacity: 0; animation: fadeIn 1s 0.8s forwards;
  }
  @keyframes fadeIn { to { opacity: 1; } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── CONTROLS BAR ── */
  .controls {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 0;
    opacity: 0; animation: fadeUp 0.7s 0.9s forwards;
  }
  .section-label {
    font-size: 9px; letter-spacing: 0.38em; color: var(--muted); text-transform: uppercase;
  }
  .refresh-btn {
    width: 36px; height: 36px;
    border: 1px solid var(--subtle);
    background: var(--subtle);
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: all 0.2s;
  }
  .refresh-btn:hover {
    border-color: var(--amber);
    color: var(--amber);
    background: var(--amber-dim);
    transform: rotate(90deg);
  }
  .refresh-btn svg { width: 14px; height: 14px; }

  /* ── TABLE CARD ── */
  .table-card {
    background: var(--surface);
    border: 1px solid var(--edge);
    border-radius: 8px;
    overflow: hidden;
    opacity: 0; animation: fadeUp 0.8s 1s forwards;
  }
  .table-head {
    display: grid;
    grid-template-columns: 1fr 110px 90px 140px 48px;
    padding: 14px 24px;
    border-bottom: 1px solid var(--edge);
    background: rgba(255,255,255,0.018);
  }
  .th {
    font-size: 8px; letter-spacing: 0.38em; color: var(--muted); text-transform: uppercase;
    display: flex; align-items: center; gap: 6px;
  }
  .th svg { width: 11px; height: 11px; opacity: 0.6; }

  /* ── ROWS ── */
  .task-row {
    display: grid;
    grid-template-columns: 1fr 110px 90px 140px 48px;
    padding: 18px 24px;
    border-bottom: 1px solid var(--edge);
    transition: background 0.25s;
    position: relative;
    overflow: hidden;

    /* scroll-reveal */
    opacity: 0; transform: translateX(-18px);
    transition: opacity 0.5s, transform 0.5s, background 0.25s;
  }
  .task-row.visible {
    opacity: 1; transform: translateX(0);
  }
  .task-row:last-child { border-bottom: none; }
  .task-row::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 2px; background: transparent;
    transition: background 0.3s;
  }
  .task-row:hover { background: var(--subtle); }
  .task-row[data-status="RUNNING"]::before { background: var(--cyan); }
  .task-row[data-status="COMPLETED"]::before { background: var(--green); }
  .task-row[data-status="FAILED"]::before { background: var(--red); }
  .task-row[data-status="PENDING"]::before { background: var(--amber); }

  /* shimmer on hover */
  .task-row::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.025) 50%, transparent 100%);
    transform: translateX(-100%);
    transition: transform 0s;
  }
  .task-row:hover::after {
    transform: translateX(100%);
    transition: transform 0.6s ease;
  }

  /* cells */
  .cell { display: flex; align-items: center; }
  .payload-text {
    font-size: 12px; color: rgba(255,255,255,0.85);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 340px;
  }
  .cell-action {
    display: flex; align-items: center; justify-content: flex-end;
  }
  .icon-btn {
    width: 30px; height: 30px;
    border: 1px solid var(--subtle);
    background: transparent;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: all 0.18s;
  }
  .icon-btn:hover { border-color: var(--amber); color: var(--amber); background: var(--amber-dim); }
  .icon-btn svg { width: 12px; height: 12px; }

  /* ── STATUS BADGE ── */
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 10px; border-radius: 3px;
    font-size: 9px; letter-spacing: 0.22em; font-weight: 500; text-transform: uppercase;
  }
  .badge-icon { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .badge-RUNNING {
    background: var(--cyan-dim); color: var(--cyan); border: 1px solid rgba(0,229,255,0.2);
  }
  .badge-RUNNING .badge-icon { background: var(--cyan); animation: pulse-dot 1.4s ease-in-out infinite; }
  .badge-COMPLETED {
    background: var(--green-dim); color: var(--green); border: 1px solid rgba(0,255,157,0.2);
  }
  .badge-COMPLETED .badge-icon { background: var(--green); }
  .badge-FAILED {
    background: var(--red-dim); color: var(--red); border: 1px solid rgba(255,59,92,0.2);
  }
  .badge-FAILED .badge-icon { background: var(--red); animation: pulse-dot 0.9s ease-in-out infinite; }
  .badge-PENDING {
    background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(245,166,35,0.2);
  }
  .badge-PENDING .badge-icon { background: var(--amber); animation: pulse-dot 2.2s ease-in-out infinite; }

  /* ── ATTEMPTS ── */
  .attempt-bar {
    display: flex; gap: 3px; align-items: center;
  }
  .attempt-pip {
    width: 5px; height: 14px; border-radius: 2px;
    background: var(--subtle);
    transition: background 0.3s;
  }
  .attempt-pip.filled-RUNNING { background: var(--cyan); }
  .attempt-pip.filled-COMPLETED { background: var(--green); }
  .attempt-pip.filled-FAILED { background: var(--red); }
  .attempt-pip.filled-PENDING { background: var(--amber); }

  /* ── TIME CELL ── */
  .time-text {
    font-size: 11px; color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .time-text.soon { color: var(--amber); }

  /* ── EMPTY STATE ── */
  .empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 24px; gap: 16px;
    color: var(--muted);
  }
  .empty svg { width: 40px; height: 40px; opacity: 0.25; }
  .empty span { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; }

  /* ── SCROLL PROGRESS ── */
  .scroll-progress {
    position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 100;
    background: linear-gradient(90deg, var(--amber) var(--progress, 0%), transparent 0%);
    transition: --progress 0.1s;
  }

  /* ── FOOTER ── */
  .footer-line {
    display: flex; justify-content: space-between; align-items: center;
    padding: 32px 0 0;
    border-top: 1px solid var(--edge);
    opacity: 0; animation: fadeIn 1s 1.5s forwards;
  }
  .footer-text { font-size: 9px; color: var(--muted); letter-spacing: 0.25em; text-transform: uppercase; }

  /* live ticker */
  .ticker {
    display: flex; align-items: center; gap: 8px;
    font-size: 9px; color: var(--muted); letter-spacing: 0.18em;
  }
  .ticker-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--green);
    animation: pulse-dot 2s ease-in-out infinite;
  }

  /* ── FLOAT IN new rows ── */
  @keyframes rowEnter {
    from { opacity: 0; transform: translateX(-18px); }
    to { opacity: 1; transform: translateX(0); }
  }
`

/* ── SVG ICONS ── */
const IconCrown = () => (
  <svg viewBox="0 0 16 16" className="crown-icon">
    <path d="M2 12h12l1-7-3.5 2.5L8 3 6.5 7.5 3 5l-1 7z" />
  </svg>
)
const IconRefresh = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" strokeLinecap="round" />
    <path d="M8 .5 10.5 3 8 5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconPayload = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2" y="3" width="12" height="10" rx="1.5" />
    <path d="M5 7h6M5 10h4" strokeLinecap="round" />
  </svg>
)
const IconStatus = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 5v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconAttempts = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M3 8h10M8 3v10" strokeLinecap="round" />
    <circle cx="8" cy="8" r="2" />
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 5v3.5l2 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconMore = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="4" cy="8" r="0.8" fill="currentColor" />
    <circle cx="8" cy="8" r="0.8" fill="currentColor" />
    <circle cx="12" cy="8" r="0.8" fill="currentColor" />
  </svg>
)
const IconEmpty = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="10" width="36" height="28" rx="3" />
    <path d="M16 19h16M16 26h10" strokeLinecap="round" />
  </svg>
)

/* ── STATUS BADGE ── */
const Badge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    <span className="badge-icon" />
    {status}
  </span>
)

/* ── ATTEMPT PIPS ── */
const AttemptPips = ({ attempts, maxAttempts, status }) => {
  const total = Math.max(maxAttempts || 3, attempts || 0)
  return (
    <div className="attempt-bar">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`attempt-pip${i < attempts ? ` filled-${status}` : ''}`}
        />
      ))}
    </div>
  )
}

/* ── TASK ROW ── */
const TaskRow = ({ task, index }) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const runAt = new Date(task.runAt)
  const now = new Date()
  const diffMs = runAt - now
  const soon = diffMs < 10000 && diffMs > 0

  return (
    <div
      ref={ref}
      className={`task-row${visible ? ' visible' : ''}`}
      data-status={task.status}
      style={{ transitionDelay: `${index * 55}ms` }}
    >
      <div className="cell">
        <span className="payload-text">{task.payload}</span>
      </div>
      <div className="cell">
        <Badge status={task.status} />
      </div>
      <div className="cell">
        <AttemptPips attempts={task.attempts} maxAttempts={task.maxAttempts} status={task.status} />
      </div>
      <div className="cell">
        <span className={`time-text${soon ? ' soon' : ''}`}>
          {runAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
      <div className="cell-action">
        <button className="icon-btn"><IconMore /></button>
      </div>
    </div>
  )
}

/* ── MAIN APP ── */
export default function App() {
  const [tasks, setTasks] = useState([])
  const [progress, setProgress] = useState(0)
  const [tick, setTick] = useState(0)

  const fetchTasks = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${API_URL}/api/tasks`);
      const data = await res.json()
      setTasks(data)
      setTick(t => t + 1)
    } catch { /* dev: silent */ }
  }

  useEffect(() => {
    // 1. Define the function inside or outside
    const loadData = async () => {
      await fetchTasks();
    };

    // 2. Call it
    loadData();

    // 3. Set up the polling interval
    const interval = setInterval(fetchTasks, 3000);

    // 4. Cleanup
    return () => clearInterval(interval);
  }, []); // Empty dependency array is correct for "on mount"

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const counts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <style>{CSS}</style>

      {/* scroll progress */}
      <div className="scroll-progress" style={{ background: `linear-gradient(90deg, var(--amber) ${progress}%, transparent 0%)` }} />

      {/* ambient layers */}
      <div className="grid-texture" />
      <div className="ambient">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="scanlines" />
      <div className="vignette" />

      <div className="shell">

        {/* HERO */}
        <header className="hero">
          <div className="hero-eyebrow">
            <span className="dot-pulse" />
            Distributed Task Engine · v2.4.1
          </div>
          <h1 className="hero-title">
            CHRO<span>NOS</span>
          </h1>
          <div className="hero-meta">
            <div className="leader-badge">
              <IconCrown />
              NODE LEADER
            </div>
            <div className="meta-divider" />
            <div className="meta-stat">
              <span>RUNNING</span>
              <strong style={{ color: 'var(--cyan)' }}>{counts.RUNNING || 0}</strong>
            </div>
            <div className="meta-divider" />
            <div className="meta-stat">
              <span>COMPLETED</span>
              <strong style={{ color: 'var(--green)' }}>{counts.COMPLETED || 0}</strong>
            </div>
            <div className="meta-divider" />
            <div className="meta-stat">
              <span>FAILED</span>
              <strong style={{ color: 'var(--red)' }}>{counts.FAILED || 0}</strong>
            </div>
            <div className="meta-divider" />
            <div className="meta-stat">
              <span>TOTAL</span>
              <strong>{tasks.length}</strong>
            </div>
          </div>
          <div className="hero-line" />
        </header>

        {/* CONTROLS */}
        <div className="controls">
          <span className="section-label">Task Queue</span>
          <button className="refresh-btn" onClick={fetchTasks} title="Refresh">
            <IconRefresh />
          </button>
        </div>

        {/* TABLE */}
        <div className="table-card">
          <div className="table-head">
            <div className="th"><IconPayload />Payload</div>
            <div className="th"><IconStatus />Status</div>
            <div className="th"><IconAttempts />Attempts</div>
            <div className="th"><IconClock />Next Run</div>
            <div className="th" />
          </div>

          {tasks.length === 0 ? (
            <div className="empty">
              <IconEmpty />
              <span>No tasks queued</span>
            </div>
          ) : (
            tasks.map((task, i) => (
              <TaskRow key={task.id} task={task} index={i} />
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="footer-line">
          <span className="footer-text">CHRONOS · DISTRIBUTED SCHEDULER</span>
          <div className="ticker">
            <span className="ticker-dot" />
            POLLING · {tick} SYNC{tick !== 1 ? 'S' : ''}
          </div>
        </div>

      </div>
    </>
  )
}