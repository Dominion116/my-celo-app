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
              <span className={styles.primary}>Connect</span>
              <span className={styles.secondary}>Wallet</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button type="button" className={styles.pillButton} onClick={openChainModal}>
              <span className={styles.primary}>Wrong</span>
              <span className={styles.secondary}>Network</span>
            </button>
          );
        }

        return (
          <button type="button" className={styles.pillButton} onClick={openAccountModal}>
            <span className={styles.primary}>{account.displayName}</span>
            <span className={styles.secondary}>connected</span>
          </button>
        );
      }}
    </RainbowKitConnectButton.Custom>
  );
}
