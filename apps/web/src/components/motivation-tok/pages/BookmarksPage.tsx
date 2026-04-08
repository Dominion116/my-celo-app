import { BOOKMARKS, QUOTES } from "../data";
import styles from "../styles.module.css";

type BookmarksPageProps = {
  savedQuoteIds: number[];
};

export function BookmarksPage({ savedQuoteIds }: BookmarksPageProps) {
  const liveSavedQuotes = QUOTES.filter((_, index) => savedQuoteIds.includes(index + 1));

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageTitle}>Saved</p>
      </div>
      <div className={styles.bookmarkList}>
        {liveSavedQuotes.length > 0
          ? liveSavedQuotes.map((quote) => (
              <article
                key={`${quote.author}-${quote.text}`}
                className={styles.bookmarkCard}
                style={{ borderLeftColor: quote.categoryColor }}
              >
                <div className={styles.bookmarkCategory}>
                  <span className={styles.categoryDot} style={{ background: quote.categoryColor }} />
                  {quote.category}
                </div>
                <p className={styles.bookmarkQuote}>"{quote.text}"</p>
                <div className={styles.bookmarkFooter}>
                  <span className={styles.bookmarkAuthor}>- {quote.author}</span>
                </div>
              </article>
            ))
          : BOOKMARKS.map((bookmark) => (
              <article key={`${bookmark.author}-${bookmark.quote}`} className={styles.bookmarkCard} style={{ borderLeftColor: bookmark.categoryColor }}>
                <div className={styles.bookmarkCategory}>
                  <span className={styles.categoryDot} style={{ background: bookmark.categoryColor }} />
                  {bookmark.category}
                </div>
                <p className={styles.bookmarkQuote}>"{bookmark.quote}"</p>
                <div className={styles.bookmarkFooter}>
                  <span className={styles.bookmarkAuthor}>- {bookmark.author}</span>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}
