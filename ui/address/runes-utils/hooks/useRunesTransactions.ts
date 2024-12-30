import { useEffect, useState } from "react";

export type RuneTransaction = {
  txHash: string;
  addressFrom: string;
  addressTo: string;
  amountOfRunes: number;
  blockNumber: number;
  spacedRuneName: string;
  blockHash: string;
  operation: "receive" | "send";
  timeAgo: string;
};

type InputData = {
  results: Array<{
    rune: {
      spaced_name: string;
    };
    operation: "receive" | "send";
    location: {
      tx_id: string;
      block_height: number;
      block_hash: string;
      timestamp: number;
    };
    address: string;
    receiver_address: string;
    amount: string;
  }>;
};

const getRelativeTime = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const secondsAgo = now - timestamp;

  if (secondsAgo < 60) {
    return `${secondsAgo} s ago`;
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo} m ago`;
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600);
    return `${hoursAgo} h ago`;
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    const daysAgo = Math.floor(secondsAgo / 86400);
    return `${daysAgo} d ago`;
  }
};

export const transformRuneData = (
  input: string | InputData
): Array<RuneTransaction & { timeAgo: string }> => {
  const inputData: InputData =
    typeof input === "string" ? JSON.parse(input) : input;

  const groupedTransactions = inputData.results.reduce((acc, result) => {
    const key = `${result.location.tx_id}-${result.location.block_hash}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<string, InputData["results"]>);

  const allTransactions: Array<RuneTransaction & { timeAgo: string }> = [];

  Object.values(groupedTransactions).forEach((group) => {
    group.forEach((transaction) => {
      if (
        transaction.operation === "send" ||
        transaction.operation === "receive"
      ) {
        const isReceive = transaction.operation === "receive";

        const addressFrom = isReceive ? "MIDL TSS Vault" : transaction.address;
        const addressTo = isReceive
          ? transaction.address
          : transaction.receiver_address || "Unknown";

        // Skip transactions where addressTo equals addressFrom
        if (addressTo === addressFrom) return;

        allTransactions.push({
          txHash: transaction.location.tx_id,
          addressFrom,
          addressTo,
          operation: transaction.operation,
          amountOfRunes: Number.parseFloat(transaction.amount),
          blockNumber: transaction.location.block_height,
          blockHash: transaction.location.block_hash,
          spacedRuneName: transaction.rune.spaced_name,
          timeAgo: getRelativeTime(transaction.location.timestamp),
        });
      }
    });
  });

  return allTransactions;
};

export const useRunesTransactions = (btcAddress: string | undefined) => {
  const [transactions, setTransactions] = useState<Array<RuneTransaction>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchBtcTransactions = async () => {
    setIsLoading(true);

    if (!btcAddress) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://mempool.regtest.midl.xyz/runes/v1/addresses/${btcAddress}/activity`
      );

      if (response.ok) {
        const data = (await response.json()) as any;
        const transformedData = transformRuneData(data);
        setTransactions(transformedData);
      } else {
        console.warn(
          `Failed to fetch transactions. Status: ${response.status}`
        );
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch Runes transactions:", error);
      setError("Failed to fetch Runes transactions.");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBtcTransactions();
  }, [btcAddress]);

  return { transactions, error, isLoading };
};
