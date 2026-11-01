'use client';
import { useEffect, useState } from 'react';
import { getUser, onAuth, isAdmin, myPerson } from '@/lib/data';

// status: loading | anon (לא מחובר) | pending (מחובר, עוד לא בחר שם מהרשימה) | member | admin
export function useAuth() {
  const [s, setS] = useState({ status: 'loading', user: null, person: null });
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const user = await getUser();
        if (!user) return live && setS({ status: 'anon', user: null, person: null });
        const [admin, person] = await Promise.all([isAdmin(user).catch(() => false), myPerson(user).catch(() => null)]);
        live && setS({ status: admin ? 'admin' : person ? 'member' : 'pending', user, person });
      } catch { live && setS({ status: 'anon', user: null, person: null }); }
    };
    load();
    const to = setTimeout(() => live && setS((x) => x.status === 'loading' ? { status: 'anon', user: null, person: null } : x), 6000);
    const off = onAuth(load);
    window.addEventListener('focus', load);
    return () => { live = false; clearTimeout(to); off(); window.removeEventListener('focus', load); };
  }, []);
  return s;
}
