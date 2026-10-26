import { useEffect, useRef } from 'react';

let scriptPromise;
function loadTurnstile() {
  if (window.turnstile?.render) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const timer = setTimeout(fail, 20000);
    function fail() {
      clearTimeout(timer); script.remove(); scriptPromise = undefined;
      reject(new Error('Verification could not load'));
    }
    script.onerror = fail;
    script.onload = () => {
      if (!window.turnstile?.render) { fail(); return; }
      clearTimeout(timer); resolve(window.turnstile);
    };
    document.head.append(script);
  });
  return scriptPromise;
}

export default function ReviewChallenge({ siteKey, language, onToken, onState }) {
  const container = useRef(null);
  useEffect(() => {
    let disposed = false;
    let widget;
    let api;
    onToken(''); onState('loading');
    loadTurnstile().then(turnstile => {
      if (disposed) return;
      api = turnstile;
      widget = api.render(container.current, {
        sitekey: siteKey, action: 'review-submit', language, size: 'flexible', theme: 'light',
        callback: token => { if (!disposed) { onToken(token); onState('ready'); } },
        'expired-callback': () => { if (!disposed) { onToken(''); onState('expired'); } },
        'error-callback': () => { if (!disposed) { onToken(''); onState('error'); } },
        'timeout-callback': () => { if (!disposed) { onToken(''); onState('error'); } },
      });
    }).catch(() => { if (!disposed) { onToken(''); onState('error'); } });
    return () => {
      disposed = true;
      if (widget !== undefined) api.remove(widget);
    };
  }, [siteKey, language, onToken, onState]);
  return <div ref={container} className="min-h-16" />;
}
