'use client';
import { useEffect } from 'react';

export default function SiteMetrics() {
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/portal') || navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    const path = pathname.startsWith('/vacantes/') ? '/vacantes/detalle' : pathname;
    if (!['/', '/vacantes', '/vacantes/detalle', '/privacidad'].includes(path)) return;
    const report = (event: string) => { void fetch('/api/metrics', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event, path }) }).catch(() => {}); };
    report('page_view');
    const click = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (!anchor) return;
      const url = new URL(anchor.href);
      if (url.hostname === 'wa.me') report('whatsapp_click');
      else if (url.protocol === 'mailto:') report('email_click');
      else if (url.protocol === 'tel:') report('phone_click');
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);
  return null;
}
