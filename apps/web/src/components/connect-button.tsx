"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import styles from "./connect-button.module.css";

export function ConnectButton() {
  const [isMinipay, setIsMinipay] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (window.ethereum?.isMiniPay) {
      setIsMinipay(true);
    }
  }, []);

  if (isMinipay) {
    return null;
  }

  return (
    <RainbowKitConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
        const ready = mounted;
        const connected = ready && !!account && !!chain;

        if (!ready) {
          return <div aria-hidden="true" className={styles.placeholder} />;
        }

        if (!connected) {
          return (
            <button type="button" className={styles.pillButton} onClick={openConnectModal}>
              <FlameIcon />
              <span className={styles.primary}>Connect</span>
              <span className={styles.secondary}>wallet</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button type="button" className={styles.pillButton} onClick={openChainModal}>
              <FlameIcon />
              <span className={styles.primary}>Wrong</span>
              <span className={styles.secondary}>network</span>
            </button>
          );
        }

        return (
          <button type="button" className={styles.pillButton} onClick={openAccountModal}>
            <FlameIcon />
            <span className={styles.primary}>{account.displayName}</span>
            <span className={styles.secondary}>connected</span>
          </button>
        );
      }}
    </RainbowKitConnectButton.Custom>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.flameIcon}>
      <path d="M12 2C9 7 6 9 6 13a6 6 0 0 0 12 0c0-4-3-6-6-11z" fill="#f5c842" stroke="none" />
      <path d="M12 8c-1 3-3 4-3 6a3 3 0 0 0 6 0c0-2-2-3-3-6z" fill="#f97316" stroke="none" />
    </svg>
  );
}
