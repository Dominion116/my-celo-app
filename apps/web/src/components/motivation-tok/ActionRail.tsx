import styles from "./styles.module.css";

type ActionRailProps = {
  likes: string;
  dislikes: string;
  saves: string;
  liked: boolean;
  disliked: boolean;
  saved: boolean;
  onAction: (type: "like" | "dislike" | "save" | "share") => void;
};

export function ActionRail({
  likes,
  dislikes,
  saves,
  liked,
  disliked,
  saved,
  onAction,
}: ActionRailProps) {
  return (
    <aside className={styles.actionRail}>
      <button type="button" className={`${styles.actionBtn} ${liked ? styles.liked : ""}`} onClick={() => onAction("like")}>
        <div className={styles.actionIcon}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <span className={styles.actionLabel}>{likes}</span>
      </button>

      <button type="button" className={`${styles.actionBtn} ${disliked ? styles.disliked : ""}`} onClick={() => onAction("dislike")}>
        <div className={styles.actionIcon}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
          </svg>
        </div>
        <span className={styles.actionLabel}>{dislikes}</span>
      </button>

      <button type="button" className={`${styles.actionBtn} ${saved ? styles.saved : ""}`} onClick={() => onAction("save")}>
        <div className={styles.actionIcon}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span className={styles.actionLabel}>{saves}</span>
      </button>

      <button type="button" className={styles.actionBtn} onClick={() => onAction("share")}>
        <div className={styles.actionIcon}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
          </svg>
        </div>
        <span className={styles.actionLabel}>Share</span>
      </button>
    </aside>
  );
}
