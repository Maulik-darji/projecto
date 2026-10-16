import { useState, useEffect } from 'react'
import { logOut, ADMIN_EMAIL, firebaseConfig } from '../../lib/firebase'
import {
  subscribeToWaitlist,
  subscribeToVotes,
  deleteWaitlistEntry,
  joinWaitlist,
  getLocalLeads,
  getLocalVotes
} from '../../lib/interest'

const ALL_REASONS = [
  'Cursor & work',
  'Notes & reminders',
  'Talking to the AI',
  'Smart home',
  'Presentations',
  'Accessibility'
]

export default function AdminDashboard({ user }) {
  const [waitlist, setWaitlist] = useState(() => getLocalLeads())
  const [votes, setVotes] = useState(() => getLocalVotes())
  const [loading, setLoading] = useState(false)
  const [firestoreError, setFirestoreError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('ALL')
  const [activeTab, setActiveTab] = useState('waitlist') // 'waitlist' | 'votes' | 'config'
  const [copiedEmail, setCopiedEmail] = useState(null)
  const [testEmail, setTestEmail] = useState('')
  const [testReasons, setTestReasons] = useState(['Cursor & work'])
  const [addingTest, setAddingTest] = useState(false)
  const [reconnectCount, setReconnectCount] = useState(0)

  // Real-time Firestore subscriptions with local storage backup
  useEffect(() => {
    // 1. Load local cache immediately
    const localLeads = getLocalLeads()
    const localVotes = getLocalVotes()
    if (localLeads.length > 0) setWaitlist(localLeads)
    if (localVotes.length > 0) setVotes(localVotes)

    // 2. Connect to Firestore
    setLoading(true)
    const unsubWaitlist = subscribeToWaitlist(
      (firestoreItems) => {
        // Merge Firestore items with any locally submitted leads
        const currentLocals = getLocalLeads()
        const merged = [...firestoreItems]
        currentLocals.forEach((loc) => {
          if (!merged.some((f) => f.email?.toLowerCase() === loc.email?.toLowerCase())) {
            merged.push(loc)
          }
        })
        setWaitlist(merged)
        setLoading(false)
        setFirestoreError(null)
      },
      (err) => {
        setFirestoreError(err.message || 'Firestore connection issue')
        setLoading(false)
        setWaitlist(getLocalLeads())
      }
    )

    // Listen to Votes
    const unsubVotes = subscribeToVotes(
      (items) => {
        const currentLocals = getLocalVotes()
        const mergedVotes = [...items]
        currentLocals.forEach((loc) => {
          if (!mergedVotes.some((f) => f.id === loc.id)) {
            mergedVotes.push(loc)
          }
        })
        setVotes(mergedVotes)
      },
      () => {
        setVotes(getLocalVotes())
      }
    )

    return () => {
      if (typeof unsubWaitlist === 'function') unsubWaitlist()
      if (typeof unsubVotes === 'function') unsubVotes()
    }
  }, [reconnectCount])

  const handleSignOut = async () => {
    try {
      await logOut()
      window.location.reload()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleDelete = async (id, email) => {
    if (window.confirm(`Delete ${email} from waitlist?`)) {
      try {
        await deleteWaitlistEntry(id)
        setWaitlist((prev) => prev.filter((item) => item.id !== id))
      } catch (err) {
        alert('Could not delete: ' + err.message)
      }
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedEmail(text)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const exportCSV = () => {
    if (!waitlist.length) {
      alert('No data to export.')
      return
    }
    const headers = ['Email', 'Reasons', 'Date', 'Source', 'ID']
    const rows = waitlist.map((item) => {
      const date = item.createdAt?.toDate
        ? item.createdAt.toDate().toISOString()
        : item.clientTimestamp || ''
      const reasons = Array.isArray(item.reasons) ? item.reasons.join('; ') : ''
      const source = item.source || 'firestore'
      return [`"${item.email || ''}"`, `"${reasons}"`, `"${date}"`, `"${source}"`, `"${item.id}"`]
    })
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `projecto-waitlist-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAddTest = async (e) => {
    e.preventDefault()
    if (!testEmail) return
    setAddingTest(true)
    try {
      await joinWaitlist(testEmail.trim(), testReasons)
      setTestEmail('')
      setWaitlist(getLocalLeads())
    } catch (err) {
      // Even if Firestore is not created yet, local storage was saved
      setWaitlist(getLocalLeads())
    } finally {
      setAddingTest(false)
    }
  }

  // Filtered waitlist
  const filteredWaitlist = waitlist.filter((item) => {
    const matchesSearch =
      !search ||
      (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
      (Array.isArray(item.reasons) &&
        item.reasons.some((r) => r.toLowerCase().includes(search.toLowerCase())))

    const matchesTag =
      selectedTag === 'ALL' ||
      (Array.isArray(item.reasons) && item.reasons.includes(selectedTag))

    return matchesSearch && matchesTag
  })

  // Reason counts calculation
  const reasonStats = {}
  ALL_REASONS.forEach((r) => (reasonStats[r] = 0))
  waitlist.forEach((item) => {
    if (Array.isArray(item.reasons)) {
      item.reasons.forEach((r) => {
        reasonStats[r] = (reasonStats[r] || 0) + 1
      })
    }
  })

  // Format date helper
  const formatDate = (item) => {
    if (item.createdAt?.toDate) {
      return item.createdAt.toDate().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    if (item.clientTimestamp) {
      const d = new Date(item.clientTimestamp)
      return isNaN(d.getTime()) ? 'Recent' : d.toLocaleString()
    }
    return 'Recent'
  }

  return (
    <div className="admin-page-wrap">
      {/* Admin Top Navigation */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <a href="/" className="logo">
            <span className="logo-mark"><i /><i /></span>PROJECTO
          </a>
          <span className="admin-badge">ADMIN CONSOLE</span>
        </div>

        <div className="admin-user-profile">
          <div className="admin-user-info">
            <span className="admin-user-email">{user?.email}</span>
            <span className="admin-role-tag">MASTER ADMIN</span>
          </div>
          <a href="/" className="btn btn-ghost btn-sm">
            View Live Site ↗
          </a>
          <button onClick={handleSignOut} className="btn btn-sm">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="admin-body">
        {/* Firestore Setup Banner if Firestore Database hasn't been created or rules block it */}
        {firestoreError && (
          <div className="admin-alert-banner">
            <div className="admin-alert-head">
              <strong>⚠️ FIREBASE SETUP REQUIRED: Cloud Firestore Database Not Activated</strong>
            </div>
            <p style={{ marginTop: '8px' }}>
              Your Google Authentication is working, but <strong>Cloud Firestore</strong> database has not been enabled in your Firebase project <code>projectcontrol-0</code> yet.
            </p>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--soft)', padding: '16px', margin: '14px 0', fontSize: '14px' }}>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>Follow these 3 quick steps in Firebase Console to enable live syncing:</p>
              <ol style={{ paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
                <li>
                  Open <strong><a href="https://console.firebase.google.com/project/projectcontrol-0/firestore" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: 'var(--acc)' }}>Firebase Console &gt; Firestore Database ↗</a></strong>
                </li>
                <li>
                  Click the <strong>"Create database"</strong> button, pick your database location, and select <strong>"Start in test mode"</strong> (or paste the rules below).
                </li>
                <li>
                  Click <strong>Enable / Create</strong>. Once created, click <strong>"Retry Sync"</strong> below.
                </li>
              </ol>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={() => setReconnectCount((c) => c + 1)} className="btn btn-sm btn-accent">
                Retry Sync ↻
              </button>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                (Submissions made locally in this browser will remain saved)
              </span>
            </div>
          </div>
        )}

        {/* Overview Stats Cards */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-label">Waitlist Signups</div>
            <div className="stat-value">{waitlist.length}</div>
            <div className="stat-sub">Direct interested leads</div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-label">Thumbs-Up Votes</div>
            <div className="stat-value">{votes.length}</div>
            <div className="stat-sub">Site interest reactions</div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-label">Firebase Project</div>
            <div className="stat-value" style={{ fontSize: '20px', letterSpacing: '-0.02em', marginTop: '6px' }}>
              {firebaseConfig.projectId}
            </div>
            <div className="stat-sub">
              {firestoreError ? '⚠️ Firestore Database pending' : '● Firestore Connected'}
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-label">Auth Provider</div>
            <div className="stat-value" style={{ fontSize: '20px', letterSpacing: '-0.02em', marginTop: '6px' }}>
              Google OAuth
            </div>
            <div className="stat-sub">Active: {ADMIN_EMAIL}</div>
          </div>
        </section>

        {/* Tab Bar */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'waitlist' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('waitlist')}
          >
            Waitlist Leads ({waitlist.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'votes' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('votes')}
          >
            Feature Demands ({votes.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'config' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            Firebase Diagnostics & Rules
          </button>
        </div>

        {/* Tab 1: Waitlist Table */}
        {activeTab === 'waitlist' && (
          <section className="admin-section">
            <div className="admin-table-toolbar">
              <div className="admin-search-wrap">
                <input
                  type="text"
                  placeholder="Search by email or feature..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="admin-search-input"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="search-clear-btn">
                    ✕
                  </button>
                )}
              </div>

              <div className="admin-toolbar-actions">
                <button onClick={exportCSV} className="btn btn-sm btn-ghost" title="Export waitlist to CSV">
                  Export to CSV ⤓
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="admin-tag-filter">
              <span className="filter-title">Filter by feature:</span>
              <button
                className={`tag-btn ${selectedTag === 'ALL' ? 'is-active' : ''}`}
                onClick={() => setSelectedTag('ALL')}
              >
                All ({waitlist.length})
              </button>
              {ALL_REASONS.map((r) => (
                <button
                  key={r}
                  className={`tag-btn ${selectedTag === r ? 'is-active' : ''}`}
                  onClick={() => setSelectedTag(r)}
                >
                  {r} ({reasonStats[r] || 0})
                </button>
              ))}
            </div>

            {/* Leads Table */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Email Address</th>
                    <th>Selected Interest Reasons</th>
                    <th style={{ width: '180px' }}>Date</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && waitlist.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-empty">
                        Connecting to Firebase Firestore...
                      </td>
                    </tr>
                  ) : filteredWaitlist.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-empty">
                        {search || selectedTag !== 'ALL'
                          ? 'No waitlist leads match your current filter.'
                          : 'No waitlist leads recorded yet. Try the test submission form below or join on the landing page!'}
                      </td>
                    </tr>
                  ) : (
                    filteredWaitlist.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="table-idx">{idx + 1}</td>
                        <td className="table-email">
                          <strong>{item.email}</strong>
                          {item.source === 'local' && (
                            <span className="reason-pill" style={{ marginLeft: '8px', fontSize: '9px', background: 'var(--soft)' }}>
                              Local
                            </span>
                          )}
                          {copiedEmail === item.email && <span className="copied-pill">Copied!</span>}
                        </td>
                        <td>
                          <div className="reason-pills">
                            {Array.isArray(item.reasons) && item.reasons.length > 0 ? (
                              item.reasons.map((r, ri) => (
                                <span key={ri} className="reason-pill">
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span className="no-reason">General waitlist</span>
                            )}
                          </div>
                        </td>
                        <td className="table-date">{formatDate(item)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => copyToClipboard(item.email)}
                            className="table-action-btn"
                            title="Copy email to clipboard"
                          >
                            Copy
                          </button>
                          {item.id && (
                            <button
                              onClick={() => handleDelete(item.id, item.email)}
                              className="table-action-btn btn-danger"
                              title="Delete entry"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Test Lead Form */}
            <div className="admin-quick-test">
              <div className="quick-test-header">
                <strong>Test Lead Submission</strong>
                <span>Add an entry to test live Firebase syncing</span>
              </div>
              <form onSubmit={handleAddTest} className="quick-test-form">
                <input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="quick-test-input"
                  required
                />
                <button type="submit" disabled={addingTest} className="btn btn-sm btn-accent">
                  {addingTest ? 'Adding...' : '+ Add Test Entry'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Tab 2: Feature Demand & Votes */}
        {activeTab === 'votes' && (
          <section className="admin-section">
            <h2 className="admin-section-title">Feature Demand & Interest Breakdown</h2>
            <p className="admin-section-desc">
              Data aggregated from landing page submissions and thumbs-up votes:
            </p>

            <div className="demand-bars">
              {ALL_REASONS.map((reason) => {
                const count = reasonStats[reason] || 0
                const total = waitlist.length || 1
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={reason} className="demand-bar-row">
                    <div className="demand-bar-meta">
                      <span className="demand-reason">{reason}</span>
                      <span className="demand-count">
                        {count} leads ({pct}%)
                      </span>
                    </div>
                    <div className="demand-bar-track">
                      <div className="demand-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Tab 3: Firebase Config & Rules */}
        {activeTab === 'config' && (
          <section className="admin-section">
            <h2 className="admin-section-title">Firebase System Configuration & Firestore Setup</h2>
            <div className="config-grid">
              <div className="config-card">
                <h3>Active Firebase Configuration</h3>
                <pre className="code-pre">{JSON.stringify(firebaseConfig, null, 2)}</pre>
              </div>

              <div className="config-card">
                <h3>Firestore Security Rules</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '8px 0' }}>
                  Copy and paste this into <strong>Firebase Console &gt; Firestore Database &gt; Rules</strong>:
                </p>
                <pre className="code-pre">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can submit to waitlist or thumbs up
    match /waitlist/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && request.auth.token.email == "${ADMIN_EMAIL}";
    }
    match /thumbs_up/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && request.auth.token.email == "${ADMIN_EMAIL}";
    }
  }
}`}</pre>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
