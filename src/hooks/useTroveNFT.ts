// useTroveNFT — NFT operations for transferring trove positions

import { useState } from "react";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { createPublicClient, http, isAddress } from "viem";
import { CONTRACTS } from "@/lib/contracts";

const TROVE_NFT_ABI = [
  { name: "ownerToTokenId", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "ownerOf", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }] },
  { name: "transferFrom", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }],
    outputs: [] },
  { name: "safeTransferFrom", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }],
    outputs: [] },
] as const;

const TROVE_NFT = CONTRACTS.TroveNFT as `0x${string}`;
const RPC = "https://liteforge.rpc.caldera.xyz/http";
const CHAIN_ID = CONTRACTS.chainId;

export type TxStatus = "idle" | "pending" | "success" | "error";

export function useTroveNFT() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const pub = createPublicClient({ transport: http(RPC) });

  // Get user's trove NFT tokenId
  const { data: tokenId } = useReadContract({
    address: TROVE_NFT,
    abi: TROVE_NFT_ABI,
    functionName: "ownerToTokenId",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const reset = () => {
    setStatus("idle");
    setTxHash("");
    setError("");
  };

  async function transferTrove(toAddress: string) {
    reset();
    
    if (!address) {
      setError("Wallet not connected");
      setStatus("error");
      return;
    }

    if (!tokenId || tokenId === 0n) {
      setError("You don't have a trove to transfer");
      setStatus("error");
      return;
    }

    if (!isAddress(toAddress)) {
      setError("Invalid recipient address");
      setStatus("error");
      return;
    }

    if (toAddress.toLowerCase() === address.toLowerCase()) {
      setError("Cannot transfer to yourself");
      setStatus("error");
      return;
    }

    // Check if recipient already has a trove
    try {
      const recipientTokenId = await pub.readContract({
        address: TROVE_NFT,
        abi: TROVE_NFT_ABI,
        functionName: "ownerToTokenId",
        args: [toAddress as `0x${string}`],
      }) as bigint;

      if (recipientTokenId !== 0n) {
        setError("Recipient already has a trove. They must close it first.");
        setStatus("error");
        return;
      }
    } catch (e) {
      console.error("Error checking recipient:", e);
    }

    setStatus("pending");
    setError("");

    try {
      // Use safeTransferFrom to ensure recipient can receive NFTs
      const hash = await writeContractAsync({
        chainId: CHAIN_ID,
        address: TROVE_NFT,
        abi: TROVE_NFT_ABI,
        functionName: "safeTransferFrom",
        args: [address, toAddress as `0x${string}`, tokenId],
      });

      setTxHash(hash);
      await pub.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (e: any) {
      const msg = e?.shortMessage || e?.details || e?.message || "Transfer failed";
      setError(msg);
      setStatus("error");
    }
  }

  return {
    tokenId: tokenId && tokenId !== 0n ? tokenId : null,
    status,
    txHash,
    error,
    reset,
    transferTrove,
  };
}
