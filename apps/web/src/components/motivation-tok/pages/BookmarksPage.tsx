import { BOOKMARKS } from "../data";
import styles from "../styles.module.css";

export function BookmarksPage() {
  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageTitle}>Saved</p>
      </div>
      <div className={styles.bookmarkList}>
        {BOOKMARKS.map((bookmark) => (
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
