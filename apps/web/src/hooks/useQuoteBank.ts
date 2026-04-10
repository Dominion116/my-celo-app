"use client";

import { useEffect, useMemo, useState } from "react";
import type { Quote } from "@/components/motivation-tok/data";

const QUOTE_BANK_PATH = "/data/quote-bank.json";

export function useQuoteBank() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadQuoteBank() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(QUOTE_BANK_PATH);
        if (!response.ok) {
          throw new Error(`Failed to load quote bank: ${response.status}`);
        }

        const data = (await response.json()) as Quote[];
        if (!cancelled) {
          setQuotes(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load quote bank");
          setQuotes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadQuoteBank();

    return () => {
      cancelled = true;
    };
  }, []);

  const quotesById = useMemo(() => {
    const map = new Map<number, Quote>();
    for (const quote of quotes) {
      map.set(quote.id, quote);
    }
    return map;
  }, [quotes]);

  return {
    quotes,
    quoteCount: quotes.length,
    quotesById,
    isLoading,
    error,
  };
}
