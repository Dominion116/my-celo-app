import styles from "../styles.module.css";
import { ConnectButton } from "@/components/connect-button";

type AccountPageProps = {
  streak: number;
  bestStreak: number;
  address: string;
  savedCount: number;
};

export function AccountPage({ streak, bestStreak, address, savedCount }: AccountPageProps) {
  return (
    <section className={styles.page}>
      <div className={styles.accountHero}>
        <div className={styles.accountTop}>
          <div className={styles.avatar}>MT</div>
          <div>
            <p className={styles.accountName}>Motivation Tok</p>
            <p className={styles.accountAddress}>{address}</p>
          </div>
        </div>

        <div className={styles.accountConnectButton}>
          <ConnectButton />
        </div>

        <div className={styles.streakCard}>
          <div>
            <p className={styles.streakCardLabel}>Current streak</p>
            <p className={styles.streakCardValue}>{streak}</p>
            <p className={styles.streakCardSub}>days in a row</p>
          </div>
          <div className={styles.streakBest}>
            <p className={styles.streakBestLabel}>Best</p>
            <p className={styles.streakBestValue}>{bestStreak}</p>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statTile}>
          <p className={styles.statValue}>142</p>
          <p className={styles.statLabel}>Liked</p>
        </div>
        <div className={styles.statTile}>
          <p className={styles.statValue}>{savedCount}</p>
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
