import { useEffect, useRef, useState } from 'react';
import { useLang } from '../context/LanguageContext';
import ReviewCard from './ReviewCard';
import ReviewChallenge from './ReviewChallenge';

const button = 'min-h-11 rounded-full px-6 py-3 font-body font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy disabled:opacity-60';
const input = 'mt-2 w-full rounded-xl border border-navy/30 bg-white px-4 py-3 text-dark-text focus:outline-2 focus:outline-navy';

async function fetchReviews(before, signal) {
  const response = await fetch(`/api/reviews${before ? `?before=${before}` : ''}`, { signal });
  if (!response.ok) throw new Error('load');
  const data = await response.json();
  if (!Array.isArray(data.reviews)) throw new Error('load');
  return data;
}

export default function Reviews() {
  const { t, lang } = useLang();
  const [reviews, setReviews] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const submissionId = useRef(null);
  const nameInput = useRef(null);
  const [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState(false);
  const [configVersion, setConfigVersion] = useState(0);
  const [challengeToken, setChallengeToken] = useState('');
  const [challengeState, setChallengeState] = useState('loading');
  const [challengeVersion, setChallengeVersion] = useState(0);

  async function load(before = null, signal) {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await fetchReviews(before, signal);
      setReviews(previous => before ? [...previous, ...data.reviews] : data.reviews);
      setNext(data.next);
    } catch (error) {
      if (error.name !== 'AbortError') setLoadError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchReviews(null, controller.signal).then(data => {
      setReviews(data.reviews); setNext(data.next);
    }).catch(error => {
      if (error.name !== 'AbortError') setLoadError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => { if (open) nameInput.current?.focus(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch('/api/reviews/config', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('config');
      const data = await response.json();
      if (typeof data.turnstileRequired !== 'boolean' || (data.turnstileRequired && !data.siteKey)) throw new Error('config');
      if (!controller.signal.aborted) setConfig(data);
    }).catch(() => { if (!controller.signal.aborted) setConfigError(true); });
    return () => controller.abort();
  }, [open, configVersion]);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = new FormData(form).get('name').trim();
    if (name.length < 2 || comment.trim().length < 10) { setMessage('reviews_invalid'); return; }
    if (!config || (config.turnstileRequired && !challengeToken)) { setMessage('reviews_challenge_required'); return; }
    setSending(true);
    setMessage('');
    submissionId.current ??= crypto.randomUUID();
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating: Number(rating), comment: comment.trim(), submissionId: submissionId.current, turnstileToken: challengeToken }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(response.status === 429 ? 'reviews_rate_limited' : data.error === 'challenge' ? 'reviews_challenge_required' : response.status === 400 ? 'reviews_invalid' : 'reviews_failed');
        return;
      }
      form.reset(); setRating(''); setComment(''); submissionId.current = null;
      setMessage('reviews_success');
      // Keep pending submissions out of the public list, even for their author.
    } catch { setMessage('reviews_failed'); }
    finally {
      setSending(false);
      // Tokens are single-use. A retry needs a fresh challenge, but keeps the text.
      setChallengeToken(''); setChallengeVersion(value => value + 1);
    }
  }

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="bg-white px-4 py-16 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between mb-10">
          <div className="max-w-2xl">
            <h2 id="reviews-title" className="font-heading font-bold text-3xl md:text-4xl uppercase text-navy">{t('reviews_heading')}</h2>
            <p className="font-body text-dark-text leading-relaxed mt-3">{t('reviews_intro')}</p>
          </div>
          <button type="button" aria-expanded={open} aria-controls="review-form" disabled={sending}
            onClick={() => { setOpen(!open); setConfig(null); setConfigError(false); setChallengeToken(''); }} className={`${button} shrink-0 bg-navy text-white w-full sm:w-auto`}>
            {t(open ? 'reviews_close' : 'reviews_write')}
          </button>
        </div>

        {open && <form id="review-form" onSubmit={submit} className="max-w-2xl mx-auto mb-10 rounded-2xl border border-navy/15 bg-light-gray p-5 sm:p-8 font-body">
          <fieldset disabled={sending} className="space-y-6">
            <legend className="font-heading text-2xl text-navy font-semibold mb-5">{t('reviews_write')}</legend>
            <label className="block font-bold text-navy" htmlFor="review-name">{t('reviews_name')}
              <input ref={nameInput} id="review-name" name="name" autoComplete="given-name" required minLength={2} maxLength={60} aria-describedby="review-name-hint" className={input} />
              <span id="review-name-hint" className="block text-sm font-normal text-dark-text mt-2">{t('reviews_name_hint')}</span>
            </label>
            <fieldset>
              <legend className="font-bold text-navy mb-2">{t('reviews_rating')}</legend>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(value => <label key={value} className="cursor-pointer">
                  <input type="radio" name="rating" value={value} required checked={rating === String(value)} onChange={event => setRating(event.target.value)} className="peer sr-only" />
                  <span className="flex items-center justify-center min-h-12 min-w-12 rounded-lg border border-navy/30 text-navy bg-white peer-checked:bg-navy peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy" aria-hidden="true">{value} ★</span>
                  <span className="sr-only">{value} {t('reviews_out_of')}</span>
                </label>)}
              </div>
            </fieldset>
            <label htmlFor="review-comment" className="block font-bold text-navy">{t('reviews_comment')}
              <textarea id="review-comment" name="comment" required minLength={10} maxLength={2000} rows={5} value={comment} onChange={event => setComment(event.target.value)} className={`${input} resize-y font-normal`} />
              <span className="block text-right text-sm font-normal text-dark-text">{comment.length} / 2000</span>
            </label>
            <p className="text-sm text-dark-text leading-relaxed">{t('reviews_notice')}</p>
            {!config && <p role="status">{t(configError ? 'reviews_verification_unavailable' : 'reviews_verification_loading')}</p>}
            {configError && <button className={button} type="button" onClick={() => { setConfigError(false); setConfigVersion(value => value + 1); }}>{t('reviews_retry')}</button>}
            {config?.turnstileRequired && <div>
              <ReviewChallenge key={challengeVersion} siteKey={config.siteKey} language={lang} onToken={setChallengeToken} onState={setChallengeState} />
              {challengeState !== 'ready' && <p role="status" className="text-sm mt-2">{t(challengeState === 'error' ? 'reviews_verification_unavailable' : 'reviews_challenge_required')}</p>}
              {['error', 'expired'].includes(challengeState) && <button className={button} type="button" onClick={() => { setChallengeToken(''); setChallengeVersion(value => value + 1); }}>{t('reviews_retry')}</button>}
            </div>}
            <button disabled={!config || (config.turnstileRequired && !challengeToken)} className={`${button} bg-navy text-white w-full sm:w-auto`} type="submit">{t(sending ? 'reviews_sending' : 'reviews_submit')}</button>
          </fieldset>
          {message && <p role={message === 'reviews_success' ? 'status' : 'alert'} className="mt-5 rounded-xl border border-navy/20 bg-white p-4 text-navy">{t(message)}</p>}
        </form>}

        {!loading && !loadError && reviews.length === 0 && <p className="rounded-2xl border border-dashed border-navy/25 bg-light-gray px-6 py-10 text-center font-body text-dark-text">{t('reviews_empty')}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
        </div>
        <div className="text-center font-body mt-6" aria-live="polite">
          {loading && <p>{t('reviews_loading')}</p>}
          {loadError && <><p>{t('reviews_error')}</p><button type="button" onClick={() => load(reviews.length ? next : null)} className={`${button} text-navy underline`}>{t('reviews_retry')}</button></>}
          {!loading && !loadError && next && <button type="button" onClick={() => load(next)} className={`${button} border border-navy/30 text-navy`}>{t('reviews_more')}</button>}
        </div>
      </div>
    </section>
  );
}
