'use client';
import { useEffect, useState } from 'react';
import { getUser, onAuth, isAdmin, myPerson } from '@/lib/data';

// status: loading | anon (לא מחובר) | pending (מחובר, עוד לא בחר שם מהרשימה) | member | admin
// מצב התחברות אחד משותף לכל הדפים: טעינה אחת בכל פעם, ולא כמה במקביל
const ANON = { status: 'anon', user: null, person: null };
let state = { status: 'loading', user: null, person: null };
let inflight = null;
let started = false;
const subs = new Set();
const set = (s) => { state = s; subs.forEach((f) => f(s)); };

async function compute() {
  try {
    const user = await getUser();
    if (!user) return ANON;
    const [admin, person] = await Promise.all([isAdmin(user).catch(() => false), myPerson(user).catch(() => null)]);
    return { status: admin ? 'admin' : person ? 'member' : 'pending', user, person };
  } catch { return ANON; }
}
export function refreshAuth() {
  if (!inflight) inflight = compute().then(set).finally(() => { inflight = null; });
  return inflight;
}
function start() {
  if (started) return; started = true;
  refreshAuth();
  onAuth(refreshAuth);
  window.addEventListener('focus', refreshAuth);
  setTimeout(() => { if (state.status === 'loading') set(ANON); }, 10000);
}

export function useAuth() {
  const [s, setS] = useState(state);
  useEffect(() => { subs.add(setS); setS(state); start(); return () => subs.delete(setS); }, []);
  return s;
}
