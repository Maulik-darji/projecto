import { useEffect, useState } from 'react'
import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

// Where waitlist sign-ups and thumbs-ups are optionally POSTed as JSON.
const ENDPOINT = import.meta.env.VITE_WAITLIST_URL
const KEY = 'projecto:interest'
const EVENT = 'projecto:interest'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
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
  }
}

export async function joinWaitlist(email, reasons = []) {
  const cleanEmail = email.trim().toLowerCase()
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
  }
}

// Admin helper: subscribe to live waitlist collection in Firestore
export function subscribeToWaitlist(callback, onError) {
  try {
    const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        callback(items)
      },
      (err) => {
        console.warn('Firestore waitlist subscription error:', err)
        if (onError) onError(err)
      }
    )
  } catch (err) {
    if (onError) onError(err)
    return () => {}
  }
}

// Admin helper: subscribe to thumbs-up collection in Firestore
export function subscribeToVotes(callback, onError) {
  try {
    const q = query(collection(db, 'thumbs_up'), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
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
