import styles from "../styles.module.css";

type AccountPageProps = {
  streak: number;
};

export function AccountPage({ streak }: AccountPageProps) {
  return (
    <section className={styles.page}>
      <div className={styles.accountHero}>
        <div className={styles.accountTop}>
          <div className={styles.avatar}>MT</div>
          <div>
            <p className={styles.accountName}>Motivation Tok</p>
            <p className={styles.accountAddress}>0x4f2a...c9d1</p>
          </div>
        </div>

        <div className={styles.streakCard}>
          <div>
            <p className={styles.streakCardLabel}>Current streak</p>
            <p className={styles.streakCardValue}>{streak}</p>
            <p className={styles.streakCardSub}>days in a row</p>
          </div>
          <div className={styles.streakBest}>
            <p className={styles.streakBestLabel}>Best</p>
            <p className={styles.streakBestValue}>21</p>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statTile}>
          <p className={styles.statValue}>142</p>
          <p className={styles.statLabel}>Liked</p>
        </div>
        <div className={styles.statTile}>
          <p className={styles.statValue}>38</p>
          <p className={styles.statLabel}>Saved</p>
        </div>
        <div className={styles.statTile}>
          <p className={styles.statValue}>89</p>
          <p className={styles.statLabel}>Txns</p>
        </div>
      </div>
    </section>
  );
}
