import { useEffect, useRef, useState } from 'react';
import { useLang } from '../context/LanguageContext';
import ReviewCard from '../components/ReviewCard';
import { adminRequest, AdminSignInRequired, isLocalAdminHost } from '../lib/adminRequests';

const button = 'min-h-11 rounded-lg border border-navy/25 px-4 py-2 font-bold text-navy focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50';
export default function ReviewAdmin() {
  const { t } = useLang();
  const local = isLocalAdminHost(window.location.hostname);
  // The access key stays in memory, not in browser storage or the URL.
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('pending');
  const [reviews, setReviews] = useState([]);
  const [next, setNext] = useState(null);
  const [before, setBefore] = useState(null);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(!local);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);
  const mutation = useRef(null);
  const canLoad = local ? Boolean(token) : !sessionEnded;

  useEffect(() => () => mutation.current?.abort(), []);

  useEffect(() => {
    if (!canLoad) return;
    const controller = new AbortController();
    adminRequest(`/api/admin/reviews?status=${status}${before ? `&before=${before}` : ''}`, {
      local, token, signal: controller.signal,
    }).then(data => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(data.reviews)) throw new Error('Invalid review list');
      setReviews(previous => before ? [...previous, ...data.reviews] : data.reviews);
      setNext(data.next);
    }).catch(error => {
      if (controller.signal.aborted) return;
      if (error instanceof AdminSignInRequired) {
        setToken(''); setSessionEnded(true); setReviews([]); setNext(null);
        setMessage(local ? 'reviews_unauthorized' : 'reviews_session_ended');
      } else setMessage('reviews_admin_error');
    })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [canLoad, local, token, status, before, version]);

  function signOut() {
    mutation.current?.abort();
    setToken(''); setSessionEnded(true); setReviews([]); setNext(null); setMessage('');
  }

  async function moderate(id, newStatus) {
    const controller = new AbortController();
    mutation.current = controller;
    setBusy(true); setMessage('');
    try {
      await adminRequest(`/api/admin/reviews/${id}`, {
        local, token, signal: controller.signal,
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (controller.signal.aborted) return;
      setLoading(true); setReviews([]); setBefore(null); setVersion(value => value + 1); setMessage('reviews_saved');
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof AdminSignInRequired) {
        setToken(''); setSessionEnded(true); setReviews([]); setNext(null);
        setMessage(local ? 'reviews_unauthorized' : 'reviews_session_ended');
      } else setMessage('reviews_admin_error');
    } finally { if (!controller.signal.aborted) setBusy(false); }
  }

  return <section className="max-w-6xl mx-auto px-4 py-12 font-body">
    <p className="text-sm text-dark-text mb-2">{t(local ? 'reviews_local' : 'reviews_hosted')}</p>
    <h1 className="font-heading text-3xl font-bold text-navy mb-6">{t('reviews_admin')}</h1>
    {local && !token ? <form className="max-w-xl space-y-4" onSubmit={event => {
      event.preventDefault(); setMessage(''); setReviews([]); setBefore(null); setLoading(true);
      setToken(new FormData(event.currentTarget).get('key').trim());
      event.currentTarget.reset();
    }}>
      <label className="block font-bold" htmlFor="admin-key">{t('reviews_key')}</label>
      <input id="admin-key" name="key" type="password" required autoComplete="off" aria-describedby="key-help" className="w-full border border-navy/30 rounded-lg px-4 py-3" />
      <p id="key-help" className="text-sm leading-relaxed">{t('reviews_key_help')}</p>
      <button className={button} type="submit">{t('reviews_login')}</button>
    </form> : canLoad ? <>
      <p className="mb-5 max-w-2xl">{t('reviews_moderation_note')}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map(value => <button key={value} type="button" disabled={busy} aria-pressed={value === status}
          className={`${button} ${value === status ? 'bg-light-gray underline underline-offset-4' : ''}`}
          onClick={() => { setLoading(true); setReviews([]); setNext(null); setBefore(null); setStatus(value); setMessage(''); setVersion(v => v + 1); }}>{t(`reviews_${value}`)}</button>)}
        <button type="button" disabled={busy || loading} className={button} onClick={() => { setLoading(true); setBefore(null); setReviews([]); setMessage(''); setVersion(v => v + 1); }}>{t('reviews_refresh')}</button>
        {local ? <button type="button" disabled={busy} className={button} onClick={signOut}>{t('reviews_logout')}</button>
          : <a className={button} href="/cdn-cgi/access/logout" onClick={signOut}>{t('reviews_logout')}</a>}
      </div>
      {!local && <p className="text-sm mb-5">{t('reviews_logout_help')}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map(review => <ReviewCard key={review.id} review={review}>
          <div className="flex flex-wrap gap-2">
            {status !== 'approved' && <button disabled={busy || loading} type="button" className={button} onClick={() => moderate(review.id, 'approved')}>{t('reviews_approve')}</button>}
            {status !== 'rejected' && <button disabled={busy || loading} type="button" className={button} onClick={() => moderate(review.id, 'rejected')}>{t('reviews_reject')}</button>}
            {status !== 'pending' && <button disabled={busy || loading} type="button" className={button} onClick={() => moderate(review.id, 'pending')}>{t('reviews_unpublish')}</button>}
          </div>
        </ReviewCard>)}
      </div>
      {loading && <p role="status" className="mt-5">{t('reviews_loading')}</p>}
      {!loading && !message && reviews.length === 0 && <p>{t('reviews_queue_empty')}</p>}
      {!loading && next && <button disabled={busy} type="button" className={`${button} mt-6`} onClick={() => { setLoading(true); setBefore(next); }}>{t('reviews_more')}</button>}
    </> : null}
    {message && <p role="status" className="my-5 rounded-lg bg-light-gray p-4">{t(message)}</p>}
    {!local && (sessionEnded || message === 'reviews_admin_error') &&
      <a className={`${button} inline-block`} href="/admin/reviews">{t('reviews_sign_in_again')}</a>}
  </section>;
}
