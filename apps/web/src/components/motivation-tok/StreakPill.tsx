import styles from "./styles.module.css";

type StreakPillProps = {
  streak: number;
};

export function StreakPill({ streak }: StreakPillProps) {
  return (
    <div className={styles.streakPill}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C9 7 6 9 6 13a6 6 0 0 0 12 0c0-4-3-6-6-11z" fill="#f5c842" stroke="none" />
        <path d="M12 8c-1 3-3 4-3 6a3 3 0 0 0 6 0c0-2-2-3-3-6z" fill="#f97316" stroke="none" />
      </svg>
      <span className={styles.streakCount}>{streak}</span>
      <span className={styles.streakLabel}>day streak</span>
    </div>
  );
}
