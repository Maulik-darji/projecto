import { useEffect, useRef, useState } from 'react'
import RingDrawing from './RingDrawing'

const TABS = ['Today', 'Tasks', 'Notes', 'Heard', 'Auto']

const INITIAL = {
  agenda: [
    { t: '09:30', title: 'Design review', meta: 'Studio 2 · 45 min', done: true },
    { t: '11:00', title: 'Send launch deck', meta: 'Task · due today', next: true },
    { t: '13:00', title: 'Lunch with Sam', meta: 'Calendar' },
    { t: '16:30', title: 'Gym — legs', meta: 'Routine' },
  ],
  tasks: [
    { id: 1, text: 'Send launch deck to the team', src: 'Phone', done: false },
    { id: 2, text: 'Send invoice to Alex — due Fri', src: 'Heard in conversation', done: false },
    { id: 3, text: 'Reply to the landlord', src: 'Phone', done: true },
  ],
  notes: [
    { time: '10:42', text: 'Ask about the Q4 budget before Friday.', src: 'Voice note' },
    { time: 'Yesterday', text: 'Gift ideas — film camera, linen shirt.', src: 'Phone' },
  ],
  heard: [
    { time: '14:10', who: 'Alex', said: 'Can you send me the invoice by Friday?', kept: 'Task added' },
    { time: '12:55', who: 'Mom', said: 'Your dentist moved to the 24th, 4 pm.', kept: 'Reminder set' },
    { time: '09:48', who: 'Priya', said: 'The door code for the new office is 4471.', kept: 'Saved to notes' },
  ],
  auto: [
    { when: 'When I get home', then: 'Lights on · play evening playlist', on: true },
    { when: 'Every weekday 08:30', then: 'Read me today\'s first three tasks', on: true },
  ],
}

const LOG_START = [
  { who: 'heard', t: '14:10', text: 'Alex: "Can you send me the invoice by Friday?"' },
  { who: 'ring', t: '14:10', text: 'Noted. Task "Send invoice to Alex", due Friday.' },
  { who: 'heard', t: '12:55', text: 'Mom: "Your dentist moved to the 24th, 4 pm."' },
  { who: 'ring', t: '12:55', text: 'Reminder moved to 24 Oct, 16:00.' },
]

// Voice commands the visitor can try. Each one updates the phone.
const COMMANDS = [
  {
    say: 'Remind me to call Mom at 7 pm',
    reply: 'Done. I\'ll buzz you at 19:00.',
    tab: 'Today',
    apply: (s) => ({ ...s, agenda: [...s.agenda, { t: '19:00', title: 'Call Mom', meta: 'Reminder · set by voice', fresh: true }] }),
  },
  {
    say: 'Add "renew passport" to my tasks',
    reply: 'Added to Tasks.',
    tab: 'Tasks',
    apply: (s) => ({ ...s, tasks: [{ id: Date.now(), text: 'Renew passport', src: 'Ring · voice', done: false, fresh: true }, ...s.tasks] }),
  },
  {
    say: 'When I leave the office, text Sam I\'m on my way',
    reply: 'Automation created. It runs when you leave the office.',
    tab: 'Auto',
    apply: (s) => ({ ...s, auto: [{ when: 'When I leave the office', then: 'Text Sam "On my way"', on: true, fresh: true }, ...s.auto] }),
  },
  {
    say: 'What was the office door code?',
    reply: 'Priya said it\'s 4471 — this morning at 09:48.',
    tab: 'Heard',
    apply: (s) => s,
  },
  {
    say: 'Note: parked on level 3, spot B12',
    reply: 'Saved to Notes.',
    tab: 'Notes',
    apply: (s) => ({ ...s, notes: [{ time: 'Now', text: 'Parked on level 3, spot B12.', src: 'Voice note', fresh: true }, ...s.notes] }),
  },
]

const now = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function Phone({ tab, setTab, data, toggle, flip }) {
  const open = data.tasks.filter((t) => !t.done).length
  return (
    <div className="phone">
      <div className="phone-status">
        <span>10:45</span>
        <span>PROJECTO ■ L R</span>
      </div>
      <div className="phone-head">
        <span className="phone-date">Fri 16 Oct</span>
        <h4>Good morning.</h4>
        <p>{open} tasks, {data.agenda.length} events, {data.heard.length} things remembered for you.</p>
      </div>
      <div className="phone-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'is-on' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="phone-body">
        {tab === 'Today' && (
          <ul className="agenda">
            {[...data.agenda].sort((a, b) => a.t.localeCompare(b.t)).map((a) => (
              <li key={a.t + a.title} className={(a.done ? 'is-done ' : '') + (a.next ? 'is-next ' : '') + (a.fresh ? 'is-fresh' : '')}>
                <span className="ag-t">{a.t}</span>
                <div>
                  <strong>{a.title}</strong>
                  <span>{a.meta}</span>
                </div>
                {a.next && <em>Ring will nudge</em>}
              </li>
            ))}
          </ul>
        )}
        {tab === 'Tasks' && (
          <ul className="tasks">
            {data.tasks.map((t) => (
              <li key={t.id} className={(t.done ? 'is-done ' : '') + (t.fresh ? 'is-fresh' : '')}>
                <button className="check" aria-label={t.done ? 'Mark not done' : 'Mark done'} onClick={() => toggle(t.id)}>
                  {t.done && <i />}
                </button>
                <div>
                  <strong>{t.text}</strong>
                  <span>{t.src}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {tab === 'Notes' && (
          <ul className="notes">
            {data.notes.map((n) => (
              <li key={n.text} className={n.fresh ? 'is-fresh' : ''}>
                <span className="note-meta">{n.time} · {n.src}</span>
                <p>{n.text}</p>
              </li>
            ))}
          </ul>
        )}
        {tab === 'Heard' && (
          <ul className="notes heard">
            {data.heard.map((h) => (
              <li key={h.time}>
                <span className="note-meta">{h.time} · {h.who} said</span>
                <p>“{h.said}”</p>
                <b>{h.kept}</b>
              </li>
            ))}
          </ul>
        )}
        {tab === 'Auto' && (
          <ul className="autos">
            {data.auto.map((a, i) => (
              <li key={a.when} className={a.fresh ? 'is-fresh' : ''}>
                <div>
                  <span>{a.when}</span>
                  <strong>{a.then}</strong>
                </div>
                <button className={'switch' + (a.on ? ' is-on' : '')} aria-label="Toggle automation" onClick={() => flip(i)}>
                  <i />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="phone-foot">Synced with ring · just now</div>
    </div>
  )
}

export default function Intelligence() {
  const [tab, setTab] = useState('Today')
  const [data, setData] = useState(INITIAL)
  const [log, setLog] = useState(LOG_START)
  const [used, setUsed] = useState([])
  const [listening, setListening] = useState(false)
  const [pulse, setPulse] = useState(0)
  const logRef = useRef(null)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log, listening])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  const sync = () => setPulse((n) => n + 1)

  const run = (i) => {
    if (listening || used.includes(i)) return
    const c = COMMANDS[i]
    setUsed((u) => [...u, i])
    setLog((l) => [...l, { who: 'you', t: now(), text: c.say }])
    setListening(true)
    later(() => {
      setListening(false)
      setLog((l) => [...l, { who: 'ring', t: now(), text: c.reply }])
      setData(c.apply)
      setTab(c.tab)
      sync()
    }, 1300)
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    setListening(false)
    setData(INITIAL)
    setLog(LOG_START)
    setUsed([])
    setTab('Today')
  }

  const toggle = (id) => {
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }))
    sync()
  }
  const flip = (i) => {
    setData((d) => ({ ...d, auto: d.auto.map((a, j) => (j === i ? { ...a, on: !a.on } : a)) }))
    sync()
  }

  return (
    <section className="intel" id="intelligence">
      <div className="section-head">
        <p className="eyebrow">Projecto Intelligence</p>
        <h2>It listens.<br />It remembers.<br />It gets it done.</h2>
        <p className="intel-lede">
          Each ring has an on-board AI with a built-in mic. Talk to it to add reminders, tasks and automations.
          When someone asks you for something mid-conversation, it notes it down so you don't forget —
          and everything syncs to the Projecto app on your phone.
        </p>
      </div>

      <div className="intel-stage">
        <div className="intel-ring">
          <div className={'ring-art' + (pulse ? ' is-pulse' : '')} key={pulse}>
            <RingDrawing callouts={false} className="intel-ring-svg" />
          </div>

          <div className="ring-log">
            <div className="ring-log-head">
              <span>RING · ON-DEVICE AI</span>
              <span className="live"><i />{listening ? 'LISTENING' : 'MEMORY ON'}</span>
            </div>
            <div className="ring-log-body" ref={logRef} aria-live="polite">
              {log.map((e, i) => (
                <p key={i} className={'log-' + e.who + (i === log.length - 1 ? ' is-new' : '')}>
                  <span>{e.t}</span>
                  <b>{e.who === 'heard' ? 'HEARD' : e.who === 'you' ? 'YOU' : 'RING'}</b>
                  {e.text}
                </p>
              ))}
              {listening && (
                <div className="wave" aria-label="Ring is listening">
                  {Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ animationDelay: `${(i % 6) * 0.08}s` }} />)}
                </div>
              )}
            </div>
          </div>

          <div className="say">
            <div className="say-head">
              <span>Hold your thumb on the ring and say…</span>
              {used.length > 0 && <button onClick={reset}>Reset</button>}
            </div>
            <div className="say-chips">
              {COMMANDS.map((c, i) => (
                <button key={c.say} onClick={() => run(i)} disabled={used.includes(i) || listening} className={used.includes(i) ? 'is-used' : ''}>
                  “{c.say}”
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="intel-link" aria-hidden>
          <svg viewBox="0 0 200 40" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="200" y2="20" className="sync-line" />
          </svg>
          <span className="sq sq-l" />
          <span className="sq sq-r" />
          <span className="intel-link-label">Encrypted sync</span>
        </div>

        <Phone tab={tab} setTab={(t) => { setTab(t); sync() }} data={data} toggle={toggle} flip={flip} />
      </div>

      <div className="intel-grid">
        <article>
          <span className="feature-n">A</span>
          <h3>Remembers for you</h3>
          <p>"Send me the invoice by Friday." "The code is 4471." When someone tells you something, the ring keeps it — as a task, a reminder or a note.</p>
        </article>
        <article>
          <span className="feature-n">B</span>
          <h3>Talk to it</h3>
          <p>Hold your thumb on the ring and speak. Add reminders, tasks and notes, or ask what's next and what someone said.</p>
        </article>
        <article>
          <span className="feature-n">C</span>
          <h3>Automations by voice</h3>
          <p>"When I leave the office, text Sam." Describe it once and the ring builds the automation across your apps and home.</p>
        </article>
        <article>
          <span className="feature-n">D</span>
          <h3>Private by default</h3>
          <p>Conversation memory is opt-in and runs on the ring and your phone. The ring's light shows whenever it is listening.</p>
        </article>
      </div>

      <div className="control">
        <div className="control-head">
          <p className="eyebrow">One pair. Everything.</p>
          <h3>Two rings to control it all.</h3>
        </div>
        <ul className="control-list">
          {[
            ['Computer', 'Cursor, click, scroll, zoom'],
            ['Phone', 'Tasks, notes, calls, messages'],
            ['Home', 'Lights, locks, thermostat'],
            ['Music', 'Play, skip, volume'],
            ['Slides', 'Next, back, pointer'],
            ['TV', 'Browse, pause, search by voice'],
          ].map(([k, v], i) => (
            <li key={k}>
              <span className="feature-n">{String(i + 1).padStart(2, '0')}</span>
              <strong>{k}</strong>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
