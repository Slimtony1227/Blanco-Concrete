import { useLang } from '../context/LanguageContext';

export default function ReviewCard({ review, children }) {
  const { t, lang } = useLang();
  return (
    <article className="min-w-0 rounded-2xl border border-navy/15 bg-light-gray p-6 flex flex-col gap-4">
      <p className="text-navy tracking-widest text-xl" aria-label={`${review.rating} ${t('reviews_out_of')}`}>
        <span aria-hidden="true">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
      </p>
      {/* React renders the review as text, never as customer-supplied HTML. */}
      <p className="font-body text-base leading-relaxed text-dark-text whitespace-pre-wrap break-words [overflow-wrap:anywhere] flex-1">{review.comment}</p>
      <div className="border-t border-navy/10 pt-4">
        <p className="font-body font-bold text-navy break-words [overflow-wrap:anywhere]">{review.display_name}</p>
        <time dateTime={review.created_at} className="font-body text-sm text-dark-text/75">
          {new Date(review.created_at).toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </time>
      </div>
      {children}
    </article>
  );
}
