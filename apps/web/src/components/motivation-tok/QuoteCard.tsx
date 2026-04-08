import type { Quote } from "./data";
import styles from "./styles.module.css";

type QuoteCardProps = {
  quote: Quote;
  state: "active" | "above" | "below" | "hidden";
};

export function QuoteCard({ quote, state }: QuoteCardProps) {
  return (
    <article className={`${styles.quoteCard} ${styles[state]}`}>
      <div className={styles.cardBg} style={{ background: quote.background }} />
      <div className={styles.cardVignette} />
      <div className={styles.cardBody}>
        <div className={styles.categoryTag}>
          <span className={styles.categoryDot} style={{ background: quote.categoryColor }} />
          {quote.category}
        </div>
        <p className={styles.quoteText}>"{quote.text}"</p>
        <div className={styles.quoteAuthor}>
          <div className={styles.authorAvatar} style={{ background: quote.avatarBackground }}>
            {quote.avatar}
          </div>
          <div>
            <p className={styles.authorName}>{quote.author}</p>
            <p className={styles.authorRole}>{quote.role}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
