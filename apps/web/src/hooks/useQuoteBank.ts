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

  const listedCount = Number(listedCountRead.data ?? 0n);

  const listedIdsRead = useReadContract({
    address: motivationTokAddress,
    abi: motivationTokAbi,
    functionName: "getListedQuoteIds",
    args: listedCount > 0 ? [0n, BigInt(listedCount)] : undefined,
    query: { enabled: contractReady && listedCount > 0 },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadQuoteBankFromChain() {
      if (!contractReady || !publicClient) {
        if (!cancelled) {
          setQuotes([]);
          setError("Set NEXT_PUBLIC_MOTIVATIONTOK_CONTRACT to load on-chain quote bank");
          setIsLoading(false);
        }
        return;
      }

      const listedIds = (listedIdsRead.data ?? []) as readonly bigint[];

      if (listedCount === 0) {
        if (!cancelled) {
          setQuotes([]);
          setError("No quotes listed on-chain yet");
          setIsLoading(false);
        }
        return;
      }

      if (listedIds.length === 0) {
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const quotesWithOrder: Array<{ order: number; quote: Quote }> = [];

        await Promise.all(
          listedIds.map(async (quoteIdBigInt, order) => {
            const quoteId = Number(listedIds[order]);
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
          throw new Error("Listed quote URIs could not be resolved");
        }

        if (!cancelled) {
          setQuotes(normalizedQuotes);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load on-chain quote bank");
          setQuotes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadQuoteBankFromChain();

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
