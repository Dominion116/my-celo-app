"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
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

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRng(seed: number) {
  let value = seed || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function shuffleBySeed(items: Quote[], seedInput: string): Quote[] {
  const rng = createRng(hashSeed(seedInput));
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function useQuoteBank() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: CELO_SEPOLIA_CHAIN_ID });
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [guestSeed, setGuestSeed] = useState("guest");

  const contractReady = Boolean(motivationTokAddress && publicClient);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storageKey = "motivationtok:guest-seed";
    const existing = window.localStorage.getItem(storageKey);

    if (existing) {
      setGuestSeed(existing);
      return;
    }

    const nextSeed = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    window.localStorage.setItem(storageKey, nextSeed);
    setGuestSeed(nextSeed);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLocalQuoteBank(reason: string) {
      try {
        const response = await fetch("/data/quote-bank.json");
        if (!response.ok) {
          throw new Error(`local quote bank fetch failed (${response.status})`);
        }

        const data = (await response.json()) as Quote[];
        if (!cancelled) {
          setQuotes(data);
          setError(`${reason} Falling back to local quote bank.`);
        }
      } catch {
        if (!cancelled) {
          setQuotes([]);
          setError(`${reason} Local quote bank is also unavailable.`);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    async function loadQuoteBankFromChain() {
      if (!cancelled) {
        setIsLoading(true);
      }

      if (!contractReady || !publicClient) {
        await loadLocalQuoteBank("On-chain contract is not configured.");
        return;
      }

      try {
        setError("");

        const listedCount = Number(
          (await publicClient.readContract({
            address: motivationTokAddress!,
            abi: motivationTokAbi,
            functionName: "getListedQuoteCount",
          })) as bigint,
        );

        if (listedCount <= 0) {
          throw new Error("No quotes listed on-chain yet.");
        }

        const listedIds = (await publicClient.readContract({
          address: motivationTokAddress!,
          abi: motivationTokAbi,
          functionName: "getListedQuoteIds",
          args: [0n, BigInt(listedCount)],
        })) as readonly bigint[];

        if (listedIds.length === 0) {
          throw new Error("Could not load listed quote IDs from chain.");
        }

        const quotesWithOrder: Array<{ order: number; quote: Quote }> = [];

        await Promise.all(
          listedIds.map(async (quoteIdBigInt, order) => {
            const quoteId = Number(quoteIdBigInt);
            const [listed, contentURI] = (await publicClient.readContract({
              address: motivationTokAddress!,
              abi: motivationTokAbi,
              functionName: "getQuoteMeta",
              args: [quoteIdBigInt],
            })) as readonly [boolean, string, bigint];

            if (!listed || !contentURI) {
              return;
            }

            const response = await fetch(toGatewayURI(contentURI));
            if (!response.ok) {
              return;
            }

            const payload = (await response.json()) as unknown;
            const content = Array.isArray(payload)
              ? payload.find((item) => Number((item as { id?: number }).id) === quoteId)
              : payload;

            const quote = normalizeQuote(content, quoteId);
            if (!quote) {
              return;
            }

            quotesWithOrder.push({ order, quote });
          }),
        );

        quotesWithOrder.sort((left, right) => left.order - right.order);
        const normalizedQuotes = quotesWithOrder.map((item) => item.quote);

        if (normalizedQuotes.length === 0) {
          throw new Error("Listed quote URIs could not be resolved.");
        }

        if (!cancelled) {
          setQuotes(normalizedQuotes);
          setError("");
          setIsLoading(false);
        }
      } catch (err) {
        await loadLocalQuoteBank(err instanceof Error ? err.message : "Unable to load on-chain quote bank.");
      }
    }

    loadQuoteBankFromChain();

    return () => {
      cancelled = true;
    };
  }, [contractReady, publicClient]);

  const seededQuotes = useMemo(() => {
    if (quotes.length === 0) {
      return quotes;
    }

    const identitySeed = address ? address.toLowerCase() : `guest:${guestSeed}`;
    return shuffleBySeed(quotes, identitySeed);
  }, [address, guestSeed, quotes]);

  const quotesById = useMemo(() => {
    const map = new Map<number, Quote>();
    for (const quote of seededQuotes) {
      map.set(quote.id, quote);
    }
    return map;
  }, [seededQuotes]);

  return {
    quotes: seededQuotes,
    quoteCount: seededQuotes.length,
    quotesById,
    isLoading,
    error,
  };
}
