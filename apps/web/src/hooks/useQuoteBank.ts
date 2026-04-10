"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useReadContract } from "wagmi";
import type { Quote } from "@/components/motivation-tok/data";
import {
  CELO_SEPOLIA_CHAIN_ID,
  motivationTokAbi,
  motivationTokAddress,
} from "@/lib/contracts";

function toGatewayURI(uri: string) {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
  }

  return uri;
}

function normalizeQuote(data: unknown, fallbackId: number): Quote | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const id = Number(record.id ?? fallbackId);
  const text = typeof record.text === "string" ? record.text : "";
  const author = typeof record.author === "string" ? record.author : "Unknown";

  if (!text) {
    return null;
  }

  return {
    id,
    text,
    author,
    role: typeof record.role === "string" ? record.role : "Motivation Contributor",
    category: typeof record.category === "string" ? record.category : "Mindset",
    categoryColor: typeof record.categoryColor === "string" ? record.categoryColor : "#a78bfa",
    background:
      typeof record.background === "string"
        ? record.background
        : "linear-gradient(155deg,#0f0a1f 0%,#1a1030 55%,#080808 100%)",
    avatar: typeof record.avatar === "string" ? record.avatar : author.slice(0, 2).toUpperCase(),
    avatarImage:
      typeof record.avatarImage === "string"
        ? record.avatarImage
        : `https://i.pravatar.cc/80?img=${(id % 70) + 1}`,
    avatarBackground:
      typeof record.avatarBackground === "string"
        ? record.avatarBackground
        : "linear-gradient(135deg,#7c3aed,#4f46e5)",
    likes: Number(record.likes ?? 0),
    dislikes: Number(record.dislikes ?? 0),
    saves: Number(record.saves ?? 0),
  };
}

export function useQuoteBank() {
  const publicClient = usePublicClient({ chainId: CELO_SEPOLIA_CHAIN_ID });
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const contractReady = Boolean(motivationTokAddress && publicClient);

  const listedCountRead = useReadContract({
    address: motivationTokAddress,
    abi: motivationTokAbi,
    functionName: "getListedQuoteCount",
    query: { enabled: contractReady },
  });

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
