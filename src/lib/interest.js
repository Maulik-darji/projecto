import { useEffect, useState } from 'react'
import { db } from './firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

// Where waitlist sign-ups and thumbs-ups are optionally POSTed as JSON.
const ENDPOINT = import.meta.env.VITE_WAITLIST_URL
const KEY = 'projecto:interest'
const LEADS_KEY = 'projecto:all_leads'
const VOTES_KEY = 'projecto:all_votes'
const EVENT = 'projecto:interest'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function getLocalLeads() {
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY)) || []
  } catch {
    return []
  }
}

export function getLocalVotes() {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY)) || []
  } catch {
    return []
  }
}

function saveLocalLead(lead) {
  try {
    const list = getLocalLeads()
    const updated = [lead, ...list.filter((x) => x.email !== lead.email)]
    localStorage.setItem(LEADS_KEY, JSON.stringify(updated))
  } catch {}
}

function saveLocalVote(vote) {
  try {
    const list = getLocalVotes()
    const updated = [vote, ...list]
    localStorage.setItem(VOTES_KEY, JSON.stringify(updated))
  } catch {}
}

function write(patch) {
  const next = { ...read(), ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage blocked — state still updates for this page view
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }))
}

async function post(payload) {
  if (!ENDPOINT) return
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...payload, at: new Date().toISOString(), page: location.href }),
  })
  if (!res.ok) throw new Error('Could not reach the server. Please try again.')
}

export async function sendThumbsUp(reasons = []) {
  const voteItem = {
    id: 'local_' + Date.now(),
    reasons,
    clientTimestamp: new Date().toISOString(),
    source: 'local'
  }
  saveLocalVote(voteItem)

  // 1. Local and external post
  await post({ type: 'thumbs_up', reasons })
  write({ voted: true, reasons })

  // 2. Sync to Firebase Firestore collection 'thumbs_up'
  try {
    if (db) {
      await addDoc(collection(db, 'thumbs_up'), {
        reasons,
        createdAt: serverTimestamp(),
        clientTimestamp: new Date().toISOString(),
        userAgent: navigator?.userAgent || 'unknown',
      })
    }
  } catch (err) {
    console.warn('Firebase thumbs_up sync notice:', err.message)
    throw err
  }
}

export async function joinWaitlist(email, reasons = []) {
  const cleanEmail = email.trim().toLowerCase()
  const leadItem = {
    id: 'local_' + Date.now(),
    email: cleanEmail,
    reasons,
    clientTimestamp: new Date().toISOString(),
    source: 'local'
  }
  saveLocalLead(leadItem)

  // 1. Local and external post
  await post({ type: 'waitlist', email: cleanEmail, reasons })
  write({ joined: true, email: cleanEmail })

  // 2. Sync to Firebase Firestore collection 'waitlist'
  try {
    if (db) {
      await addDoc(collection(db, 'waitlist'), {
        email: cleanEmail,
        reasons,
        createdAt: serverTimestamp(),
        clientTimestamp: new Date().toISOString(),
        userAgent: navigator?.userAgent || 'unknown',
      })
    }
  } catch (err) {
    console.warn('Firebase waitlist sync notice:', err.message)
    throw err
  }
}

// Admin helper: subscribe to live waitlist collection in Firestore
export function subscribeToWaitlist(callback, onError) {
  let hasResolved = false

  // Safety fallback timeout in case Firestore network/channel hangs
  const timeoutId = setTimeout(() => {
    if (!hasResolved) {
      console.warn('Firestore response timeout - loading local leads fallback')
      if (onError) onError(new Error('Firestore connection timeout. Check if Firestore Database is created in Firebase Console.'))
    }
  }, 3500)

  try {
    // We query collection directly without orderBy so documents without index or createdAt are never omitted
    const colRef = collection(db, 'waitlist')
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        hasResolved = true
        clearTimeout(timeoutId)
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        // Sort descending by timestamp
        items.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.clientTimestamp || 0).getTime()
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.clientTimestamp || 0).getTime()
          return timeB - timeA
        })
        callback(items)
      },
      (err) => {
        hasResolved = true
        clearTimeout(timeoutId)
        console.warn('Firestore waitlist subscription error:', err)
        if (onError) onError(err)
      }
    )
    return () => {
      clearTimeout(timeoutId)
      unsub()
    }
  } catch (err) {
    clearTimeout(timeoutId)
    if (onError) onError(err)
    return () => {}
  }
}

// Admin helper: subscribe to thumbs-up collection in Firestore
export function subscribeToVotes(callback, onError) {
  try {
    const colRef = collection(db, 'thumbs_up')
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        callback(items)
      },
      (err) => {
        console.warn('Firestore votes subscription error:', err)
        if (onError) onError(err)
      }
    )
  } catch (err) {
    if (onError) onError(err)
    return () => {}
  }
}

// Admin helper: delete a waitlist entry
export async function deleteWaitlistEntry(id) {
  if (!id) return
  if (id.startsWith('local_')) {
    const list = getLocalLeads().filter((x) => x.id !== id)
    localStorage.setItem(LEADS_KEY, JSON.stringify(list))
    return
  }
  await deleteDoc(doc(db, 'waitlist', id))
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

// Shared across the floating button and the waitlist section
export function useInterest() {
  const [state, setState] = useState(read)
  useEffect(() => {
    const on = (e) => setState(e.detail)
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [])
  return state
}
