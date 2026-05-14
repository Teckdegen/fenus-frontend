import { useAccount, usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatUnits, parseAbiItem, type Log } from "viem";
import { CONTRACTS } from "@/lib/contracts";

// ─── Event signatures from BorrowerOperations & TroveManager ──────────────────

const BORROWER_OPS = CONTRACTS.BorrowerOperations as `0x${string}`;
const TROVE_MANAGER = CONTRACTS.TroveManager as `0x${string}`;

const EVENTS = {
  TroveOpened: parseAbiItem("event TroveOpened(address indexed owner, uint256 indexed tokenId, uint256 coll18, uint256 debt18)"),
  CollateralAdded: parseAbiItem("event CollateralAdded(address indexed owner, uint256 amount18)"),
  CollateralWithdrawn: parseAbiItem("event CollateralWithdrawn(address indexed owner, uint256 amount18)"),
  FnUSDBorrowed: parseAbiItem("event FnUSDBorrowed(address indexed owner, uint256 amount18)"),
  FnUSDRepaid: parseAbiItem("event FnUSDRepaid(address indexed owner, uint256 amount18)"),
  TroveClosed: parseAbiItem("event TroveClosed(address indexed owner, uint256 indexed tokenId)"),
} as const;

const TM_EVENTS = {
  TroveLiquidated: parseAbiItem("event TroveLiquidated(uint256 indexed tokenId, uint256 debt, uint256 coll, uint8 liquidationMode)"),
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityType =
  | "TroveOpened"
  | "CollateralAdded"
  | "CollateralWithdrawn"
  | "FnUSDBorrowed"
  | "FnUSDRepaid"
  | "TroveClosed"
  | "TroveLiquidated";

export interface ActivityItem {
  type: ActivityType;
  blockNumber: bigint;
  txHash: string;
  timestamp?: number;
  amount?: string;       // formatted
  amountRaw?: bigint;
  coll?: string;
  debt?: string;
}

export interface PortfolioStats {
  totalInteractions: number;
  totalBorrowed: string;
  totalRepaid: string;
  totalCollDeposited: string;
  totalCollWithdrawn: string;
  troveOpenCount: number;
  troveCloseCount: number;
  liquidationCount: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePortfolio() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["portfolio", address],
    enabled: isConnected && !!address && !!publicClient,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!address || !publicClient) return null;

      // Fetch all user events from BorrowerOperations
      const [
        openedLogs,
        collAddedLogs,
        collWithdrawnLogs,
        borrowedLogs,
        repaidLogs,
        closedLogs,
      ] = await Promise.all([
        publicClient.getLogs({
          address: BORROWER_OPS,
          event: EVENTS.TroveOpened,
          args: { owner: address },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: BORROWER_OPS,
          event: EVENTS.CollateralAdded,
          args: { owner: address },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: BORROWER_OPS,
          event: EVENTS.CollateralWithdrawn,
          args: { owner: address },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: BORROWER_OPS,
          event: EVENTS.FnUSDBorrowed,
          args: { owner: address },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: BORROWER_OPS,
          event: EVENTS.FnUSDRepaid,
          args: { owner: address },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: BORROWER_OPS,
          event: EVENTS.TroveClosed,
          args: { owner: address },
          fromBlock: 0n,
          toBlock: "latest",
        }),
      ]);

      // Build activity list
      const activities: ActivityItem[] = [];

      for (const log of openedLogs) {
        activities.push({
          type: "TroveOpened",
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          coll: formatUnits(log.args.coll18 ?? 0n, 18),
          debt: formatUnits(log.args.debt18 ?? 0n, 18),
        });
      }

      for (const log of collAddedLogs) {
        activities.push({
          type: "CollateralAdded",
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          amount: formatUnits(log.args.amount18 ?? 0n, 18),
          amountRaw: log.args.amount18,
        });
      }

      for (const log of collWithdrawnLogs) {
        activities.push({
          type: "CollateralWithdrawn",
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          amount: formatUnits(log.args.amount18 ?? 0n, 18),
          amountRaw: log.args.amount18,
        });
      }

      for (const log of borrowedLogs) {
        activities.push({
          type: "FnUSDBorrowed",
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          amount: formatUnits(log.args.amount18 ?? 0n, 18),
          amountRaw: log.args.amount18,
        });
      }

      for (const log of repaidLogs) {
        activities.push({
          type: "FnUSDRepaid",
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          amount: formatUnits(log.args.amount18 ?? 0n, 18),
          amountRaw: log.args.amount18,
        });
      }

      for (const log of closedLogs) {
        activities.push({
          type: "TroveClosed",
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
        });
      }

      // Sort by block number descending (most recent first)
      activities.sort((a, b) => Number(b.blockNumber - a.blockNumber));

      // Compute stats
      const totalBorrowed = borrowedLogs.reduce(
        (sum, l) => sum + (l.args.amount18 ?? 0n), 0n
      );
      const totalRepaid = repaidLogs.reduce(
        (sum, l) => sum + (l.args.amount18 ?? 0n), 0n
      );
      const totalCollDeposited = collAddedLogs.reduce(
        (sum, l) => sum + (l.args.amount18 ?? 0n), 0n
      ) + openedLogs.reduce((sum, l) => sum + (l.args.coll18 ?? 0n), 0n);
      const totalCollWithdrawn = collWithdrawnLogs.reduce(
        (sum, l) => sum + (l.args.amount18 ?? 0n), 0n
      );

      // Include initial borrow from openTrove in totalBorrowed
      const totalBorrowedWithOpen = totalBorrowed + openedLogs.reduce(
        (sum, l) => sum + (l.args.debt18 ?? 0n), 0n
      );

      const stats: PortfolioStats = {
        totalInteractions: activities.length,
        totalBorrowed: fmtAmount(totalBorrowedWithOpen, 18),
        totalRepaid: fmtAmount(totalRepaid, 18),
        totalCollDeposited: fmtAmount(totalCollDeposited, 18),
        totalCollWithdrawn: fmtAmount(totalCollWithdrawn, 18),
        troveOpenCount: openedLogs.length,
        troveCloseCount: closedLogs.length,
        liquidationCount: 0,
      };

      return { activities, stats };
    },
  });

  return {
    activities: data?.activities ?? [],
    stats: data?.stats ?? null,
    isLoading,
    error,
    isConnected,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtAmount(val: bigint, decimals: number): string {
  const n = parseFloat(formatUnits(val, decimals));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
}
