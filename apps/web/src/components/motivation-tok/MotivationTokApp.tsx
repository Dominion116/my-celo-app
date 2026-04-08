"use client";

import { useMemo, useRef, useState } from "react";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { ActionRail } from "./ActionRail";
import { BottomNav } from "./BottomNav";
import { QuoteCard } from "./QuoteCard";
import { StreakPill } from "./StreakPill";
import { QUOTES, type TabKey } from "./data";
import { SearchPage } from "./pages/SearchPage";
import { BookmarksPage } from "./pages/BookmarksPage";
import { AccountPage } from "./pages/AccountPage";
import styles from "./styles.module.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-ui" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-serif" });

function formatCount(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

export function MotivationTokApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hintHidden, setHintHidden] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const touchStartY = useRef(0);

  const currentQuote = QUOTES[currentIndex];

  const counts = useMemo(
    () => ({
      likes: formatCount(currentQuote.likes + (liked ? 1 : 0)),
      dislikes: formatCount(currentQuote.dislikes + (disliked ? 1 : 0)),
      saves: formatCount(currentQuote.saves + (saved ? 1 : 0)),
    }),
    [currentQuote, liked, disliked, saved],
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 1800);
  };

  const goTo = (next: number) => {
    if (next < 0 || next >= QUOTES.length) {
      return;
    }

    setCurrentIndex(next);
    setLiked(false);
    setDisliked(false);
    setSaved(false);
    setHintHidden(true);
  };

  const onAction = (type: "like" | "dislike" | "save" | "share") => {
    if (type === "like") {
      const nextLiked = !liked;
      setLiked(nextLiked);
      if (nextLiked) {
        setDisliked(false);
      }
      showToast(nextLiked ? "Liked · txn signed on Celo" : "Like removed");
      return;
    }

    if (type === "dislike") {
      const nextDisliked = !disliked;
      setDisliked(nextDisliked);
      if (nextDisliked) {
        setLiked(false);
      }
      showToast(nextDisliked ? "Disliked · txn signed on Celo" : "Dislike removed");
      return;
    }

    if (type === "save") {
      const nextSaved = !saved;
      setSaved(nextSaved);
      showToast(nextSaved ? "Saved · txn signed on Celo" : "Removed from saved");
      return;
    }

    showToast("Link copied to clipboard");
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
        {QUOTES.map((quote, index) => {
          let state: "active" | "above" | "below" | "hidden" = "hidden";
          if (index === currentIndex) {
            state = "active";
          } else if (index < currentIndex) {
            state = "above";
          } else if (index === currentIndex + 1) {
            state = "below";
          }

          return <QuoteCard key={`${quote.author}-${quote.text}`} quote={quote} state={state} />;
        })}
      </div>

      {activeTab === "home" && (
        <>
          <ActionRail
            likes={counts.likes}
            dislikes={counts.dislikes}
            saves={counts.saves}
            liked={liked}
            disliked={disliked}
            saved={saved}
            onAction={onAction}
          />
          <StreakPill streak={7} />
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
      {activeTab === "bookmarks" && <BookmarksPage />}
      {activeTab === "account" && <AccountPage streak={7} />}

      <div className={`${styles.toast} ${toastMessage ? styles.toastVisible : ""}`}>{toastMessage}</div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
