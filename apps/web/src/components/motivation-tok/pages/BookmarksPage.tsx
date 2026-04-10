import type { Quote } from "../data";
import styles from "../styles.module.css";

type BookmarksPageProps = {
  savedQuoteIds: number[];
  quotesById: Map<number, Quote>;
  isLoading: boolean;
};

export function BookmarksPage({ savedQuoteIds, quotesById, isLoading }: BookmarksPageProps) {
  const liveSavedQuotes = savedQuoteIds
    .map((quoteId) => quotesById.get(quoteId))
    .filter((quote): quote is Quote => Boolean(quote));

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageTitle}>Saved</p>
      </div>
      <div className={styles.bookmarkList}>
        {isLoading && <p className={styles.emptyState}>Loading saved quotes...</p>}

        {!isLoading && liveSavedQuotes.length > 0 &&
          liveSavedQuotes.map((quote) => (
            <article key={quote.id} className={styles.bookmarkCard} style={{ borderLeftColor: quote.categoryColor }}>
              <div className={styles.bookmarkCategory}>
                <span className={styles.categoryDot} style={{ background: quote.categoryColor }} />
                {quote.category}
              </div>
              <p className={styles.bookmarkQuote}>"{quote.text}"</p>
              <div className={styles.bookmarkFooter}>
                <span className={styles.bookmarkAuthor}>- {quote.author}</span>
              </div>
            </article>
          ))}

        {!isLoading && liveSavedQuotes.length === 0 && (
          <p className={styles.emptyState}>No saved quotes yet.</p>
        )}
      </div>
    </section>
  );
}
