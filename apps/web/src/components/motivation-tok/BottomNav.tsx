import type { TabKey } from "./data";
import styles from "./styles.module.css";

type BottomNavProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabClass = (tab: TabKey) => `${styles.navItem} ${activeTab === tab ? styles.navActive : ""}`;

  return (
    <nav className={styles.navbar}>
      <button type="button" className={tabClass("home")} onClick={() => onTabChange("home")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
        <span className={styles.navLabel}>Home</span>
      </button>

      <button type="button" className={tabClass("search")} onClick={() => onTabChange("search")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span className={styles.navLabel}>Search</span>
      </button>

      <button type="button" className={tabClass("bookmarks")} onClick={() => onTabChange("bookmarks")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span className={styles.navLabel}>Saved</span>
      </button>

      <button type="button" className={tabClass("account")} onClick={() => onTabChange("account")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        <span className={styles.navLabel}>Account</span>
      </button>
    </nav>
  );
}
