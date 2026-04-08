import { CATEGORIES, TRENDING_AUTHORS } from "../data";
import styles from "../styles.module.css";

type SearchPageProps = {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

export function SearchPage({ activeCategory, onCategoryChange }: SearchPageProps) {
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
        <input type="text" placeholder="Search quotes, authors..." />
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

      <div className={styles.trendingList}>
        <p className={styles.sectionLabel}>Trending authors</p>
        {TRENDING_AUTHORS.map((author, index) => (
          <div key={author} className={styles.trendItem}>
            <span className={styles.trendRank}>{index + 1}</span>
            <div>
              <p className={styles.trendName}>{author}</p>
              <p className={styles.trendCount}>{(14.2 - index * 1.7).toFixed(1)}k interactions this week</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
