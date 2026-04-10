"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { encodeFunctionData } from "viem";
import { CELO_SEPOLIA_CHAIN_ID, motivationTokAbi, motivationTokAddress } from "@/lib/contracts";

type ActionType = "like" | "dislike" | "save" | "share" | "visit";

export function useMotivationTok(currentQuoteId?: number) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: CELO_SEPOLIA_CHAIN_ID });
  const { data: walletClient } = useWalletClient({ chainId: CELO_SEPOLIA_CHAIN_ID });
  const [isPending, setIsPending] = useState(false);

  const quoteId = currentQuoteId !== undefined ? BigInt(currentQuoteId) : undefined;
  const canQueryQuote = Boolean(quoteId && motivationTokAddress);
  const canQueryUser = Boolean(address && motivationTokAddress);

  const countersRead = useReadContract({
    address: motivationTokAddress,
    abi: motivationTokAbi,
    functionName: "getQuoteCounters",
    args: canQueryQuote ? [quoteId!] : undefined,
    query: { enabled: canQueryQuote },
  });

  const userStateRead = useReadContract({
    address: motivationTokAddress,
    abi: motivationTokAbi,
    functionName: "getUserQuoteState",
    args: canQueryUser && canQueryQuote ? [address!, quoteId!] : undefined,
    query: { enabled: canQueryUser && canQueryQuote },
  });

  const streakRead = useReadContract({
    address: motivationTokAddress,
    abi: motivationTokAbi,
    functionName: "getUserStreak",
    args: canQueryUser ? [address!] : undefined,
    query: { enabled: canQueryUser },
  });

  const savedIdsRead = useReadContract({
    address: motivationTokAddress,
    abi: motivationTokAbi,
    functionName: "getSavedQuoteIds",
    args: canQueryUser ? [address!, 0n, 100n] : undefined,
    query: { enabled: canQueryUser },
  });

  const refreshReads = useCallback(async () => {
    await Promise.all([
      countersRead.refetch(),
      userStateRead.refetch(),
      streakRead.refetch(),
      savedIdsRead.refetch(),
    ]);
  }, [countersRead, savedIdsRead, streakRead, userStateRead]);

  const writeAction = useCallback(
    async (type: ActionType, indexOverride?: number) => {
      if (!motivationTokAddress || !publicClient || !isConnected || !walletClient) {
        throw new Error("Wallet not connected or contract not configured");
      }

      const actionQuoteId = quoteIdFromIndex(indexOverride ?? currentIndex);
      const sendTransaction: any = walletClient.sendTransaction;
      setIsPending(true);

      try {
        let hash: `0x${string}`;

        if (type === "visit") {
          hash = await sendTransaction({
            to: motivationTokAddress,
            data: encodeFunctionData({ abi: motivationTokAbi, functionName: "recordVisit" }),
          } as any);
        } else if (type === "like") {
          hash = await sendTransaction({
            to: motivationTokAddress,
            data: encodeFunctionData({
              abi: motivationTokAbi,
              functionName: "toggleLike",
              args: [actionQuoteId],
            }),
          } as any);
        } else if (type === "dislike") {
          hash = await sendTransaction({
            to: motivationTokAddress,
            data: encodeFunctionData({
              abi: motivationTokAbi,
              functionName: "toggleDislike",
              args: [actionQuoteId],
            }),
          } as any);
        } else if (type === "save") {
          hash = await sendTransaction({
            to: motivationTokAddress,
            data: encodeFunctionData({
              abi: motivationTokAbi,
              functionName: "toggleSave",
              args: [actionQuoteId],
            }),
          } as any);
        } else {
          hash = await sendTransaction({
            to: motivationTokAddress,
            data: encodeFunctionData({
              abi: motivationTokAbi,
              functionName: "recordShare",
              args: [actionQuoteId],
            }),
          } as any);
        }

        await publicClient.waitForTransactionReceipt({ hash });
        await refreshReads();
      } finally {
        setIsPending(false);
      }
    },
    [currentIndex, isConnected, publicClient, refreshReads, walletClient],
  );

  const counters = countersRead.data ?? [0n, 0n, 0n, 0n, 0n];
  const userState = userStateRead.data ?? [false, false, false];
  const streak = streakRead.data ?? [0n, 0n, 0n, 0n];
  const savedIds = (savedIdsRead.data ?? []) as readonly bigint[];

  return {
    contractReady: Boolean(motivationTokAddress),
    isConnected,
    address,
    isPending,
    likes: Number(counters[0]),
    dislikes: Number(counters[1]),
    saves: Number(counters[2]),
    shares: Number(counters[3]),
    interactions: Number(counters[4]),
    liked: Boolean(userState[0]),
    disliked: Boolean(userState[1]),
    saved: Boolean(userState[2]),
    streak: Number(streak[0]),
    bestStreak: Number(streak[1]),
    savedQuoteIds: savedIds.map((id) => Number(id)),
    writeAction,
    refreshReads,
  };
}
