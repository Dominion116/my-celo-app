"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { ActionRail } from "./ActionRail";
import { BottomNav } from "./BottomNav";
import { QuoteCard } from "./QuoteCard";
import { StreakPill } from "./StreakPill";
import { type TabKey } from "./data";
import { SearchPage } from "./pages/SearchPage";
import { BookmarksPage } from "./pages/BookmarksPage";
import { AccountPage } from "./pages/AccountPage";
import styles from "./styles.module.css";
import { useMotivationTok } from "@/hooks/useMotivationTok";
import { useQuoteBank } from "@/hooks/useQuoteBank";
import { truncateAddress } from "@/lib/app-utils";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-ui" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-serif" });

function formatCount(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

export function MotivationTokApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [toastMessage, setToastMessage] = useState("");
  const [hintHidden, setHintHidden] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const hasRecordedVisit = useRef(false);
  const touchStartY = useRef(0);
  const { quotes, quoteCount, quotesById, isLoading: quoteBankLoading, error: quoteBankError } = useQuoteBank();
  const {
    contractReady,
    isConnected,
    address,
    isPending,
    likes,
    dislikes,
    saves,
    liked,
    disliked,
    saved,
    streak,
    bestStreak,
    savedQuoteIds,
    writeAction,
  } = useMotivationTok(currentIndex);

  const currentQuote = quotes[currentIndex];

  const feedIndices = useMemo(() => {
    if (quoteCount === 0) {
      return [];
    }

    const start = Math.max(0, currentIndex - 1);
    const end = Math.min(quoteCount - 1, currentIndex + 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentIndex, quoteCount]);

  const counts = useMemo(
    () => ({
      likes: formatCount(likes),
      dislikes: formatCount(dislikes),
      saves: formatCount(saves),
    }),
    [likes, dislikes, saves],
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 1800);
  };

  const goTo = (next: number) => {
    if (next < 0 || next >= quoteCount) {
      return;
    }

    setCurrentIndex(next);
    setHintHidden(true);
  };

  useEffect(() => {
    if (quoteCount > 0 && currentIndex >= quoteCount) {
      setCurrentIndex(0);
    }
  }, [currentIndex, quoteCount]);

  useEffect(() => {
    if (!contractReady || !isConnected || hasRecordedVisit.current) {
      return;
    }

    hasRecordedVisit.current = true;
    writeAction("visit").catch(() => {
      showToast("Visit tx skipped");
    });
  }, [contractReady, isConnected, writeAction]);

  const onAction = async (type: "like" | "dislike" | "save" | "share") => {
    if (!contractReady) {
      showToast("Set NEXT_PUBLIC_MOTIVATIONTOK_CONTRACT in env");
      return;
    }

    if (!isConnected) {
      showToast("Connect wallet to continue");
      return;
    }

    try {
      if (type === "share" && currentQuote) {
        await navigator.clipboard.writeText(currentQuote.text);
      }

      await writeAction(type);

      if (type === "like") {
        showToast(liked ? "Like removed" : "Liked · txn confirmed on Celo");
      } else if (type === "dislike") {
        showToast(disliked ? "Dislike removed" : "Disliked · txn confirmed on Celo");
      } else if (type === "save") {
        showToast(saved ? "Removed from saved" : "Saved · txn confirmed on Celo");
      } else {
        showToast("Shared · txn confirmed on Celo");
      }
    } catch {
      showToast("Transaction rejected or failed");
    }
  };

  return (
    <div className={`${styles.app} ${dmSans.variable} ${dmSerif.variable}`}>
      <div
        className={styles.feed}
        onTouchStart={(event) => {
          touchStartY.current = event.touches[0].clientY;
        }}
        onTouchEnd={(event) => {
          const delta = touchStartY.current - event.changedTouches[0].clientY;
          if (delta > 50) {
            goTo(currentIndex + 1);
          } else if (delta < -50) {
            goTo(currentIndex - 1);
          }
        }}
      >
        {quoteBankLoading && <div className={styles.feedState}>Loading quote bank...</div>}
        {!quoteBankLoading && quoteCount === 0 && (
          <div className={styles.feedState}>{quoteBankError || "No quotes available yet."}</div>
        )}

        {feedIndices.map((index) => {
          const quote = quotes[index];
          if (!quote) {
            return null;
          }

          let state: "active" | "above" | "below" | "hidden" = "hidden";
          if (index === currentIndex) {
            state = "active";
          } else if (index < currentIndex) {
            state = "above";
          } else if (index === currentIndex + 1) {
            state = "below";
          }

          return <QuoteCard key={quote.id} quote={quote} state={state} />;
        })}
      </div>

      {activeTab === "home" && currentQuote && (
        <>
          <ActionRail
            likes={counts.likes}
            dislikes={counts.dislikes}
            saves={counts.saves}
            liked={liked}
            disliked={disliked}
            saved={saved}
            onAction={onAction}
            disabled={isPending}
          />
          <StreakPill streak={Math.max(streak, 1)} />
          {!hintHidden && (
            <div className={styles.swipeIndicator}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 15l-6-6-6 6" stroke="rgba(240,236,228,0.4)" strokeWidth="1.6" fill="none" />
              </svg>
              <span>swipe up</span>
            </div>
          )}
        </>
      )}

      {activeTab === "search" && <SearchPage activeCategory={activeCategory} onCategoryChange={setActiveCategory} />}
      {activeTab === "bookmarks" && (
        <BookmarksPage savedQuoteIds={savedQuoteIds} quotesById={quotesById} isLoading={quoteBankLoading} />
      )}
      {activeTab === "account" && (
        <AccountPage
          streak={Math.max(streak, 1)}
          bestStreak={Math.max(bestStreak, 1)}
          address={address ? truncateAddress(address) : "Not connected"}
          savedCount={savedQuoteIds.length}
        />
      )}

      <div className={`${styles.toast} ${toastMessage ? styles.toastVisible : ""}`}>{toastMessage}</div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
