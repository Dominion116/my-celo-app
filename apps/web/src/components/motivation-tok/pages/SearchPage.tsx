import type { Quote } from "../data";
import { CATEGORIES } from "../data";
import styles from "../styles.module.css";

type SearchPageProps = {
  activeCategory: string;
  searchQuery: string;
  quotes: Quote[];
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onQuoteSelect: (quoteId: number) => void;
};

export function SearchPage({
  activeCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  quotes,
  onQuoteSelect,
}: SearchPageProps) {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredQuotes = quotes.filter((quote) => {
    const matchesCategory = activeCategory === "All" || quote.category === activeCategory;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      quote.text.toLowerCase().includes(normalizedQuery) ||
      quote.author.toLowerCase().includes(normalizedQuery) ||
      quote.category.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageTitle}>Explore</p>
      </div>

      <div className={styles.searchWrap}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search quotes, authors..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className={styles.sectionWrap}>
        <p className={styles.sectionLabel}>Categories</p>
        <div className={styles.tagGrid}>
          {CATEGORIES.map((category) => (
            <button
              type="button"
              key={category.name}
              onClick={() => onCategoryChange(category.name)}
              className={`${styles.tag} ${activeCategory === category.name ? styles.tagActive : ""}`}
            >
              <span className={styles.tagDot} style={{ background: category.color }} />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.searchResults}>
        <div className={styles.sectionWrap}>
          <p className={styles.sectionLabel}>
            Matches {filteredQuotes.length > 0 ? `(${filteredQuotes.length})` : ""}
          </p>
          <div className={styles.searchResultList}>
            {filteredQuotes.length > 0 ? (
              filteredQuotes.slice(0, 12).map((quote) => (
                <button
                  type="button"
                  key={quote.id}
                  className={styles.searchResultCard}
                  style={{ borderLeftColor: quote.categoryColor }}
                  onClick={() => onQuoteSelect(quote.id)}
                >
                  <div className={styles.searchResultTop}>
                    <div className={styles.searchResultCategory}>
                      <span className={styles.categoryDot} style={{ background: quote.categoryColor }} />
                      {quote.category}
                    </div>
                    <span className={styles.searchResultMeta}>Open</span>
                  </div>
                  <p className={styles.searchResultQuote}>"{quote.text}"</p>
                  <p className={styles.searchResultAuthor}>- {quote.author}</p>
                </button>
              ))
            ) : (
              <p className={styles.emptyState}>No quotes match your search.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
