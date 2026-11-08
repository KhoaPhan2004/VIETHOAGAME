"use client";
import { useEffect, useState } from 'react';
export default function PortalCsrf() { const [token, setToken] = useState(''); useEffect(() => { setToken(document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''); }, []); return token ? <input type="hidden" name="_token" value={token} /> : null; }
