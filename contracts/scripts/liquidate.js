/**
 * Simple Liquidation Script
 * - Shows all active troves
 * - Highlights troves below 130% collateral ratio
 * - Allows liquidation of underwater troves
 */

import { ethers } from "ethers";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env from contracts folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const RPC_URL = "https://liteforge.rpc.caldera.xyz/http";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Contract addresses — updated after redeployment
const TROVE_MANAGER = "0xD001F1E7CB690C12E191bf7Aa1c3B6332D92a8B4";
const TROVE_NFT = "0x3A856810c38a0446692c8C44400A09Dc9bAA519f";
const PRICE_FEED = "0x39992B70D9C36902aeE699185E94d021BDa94ab6";

const MCR = 1.30; // 130% minimum collateral ratio

// ABIs
const TROVE_MANAGER_ABI = [
  "function getTroveOwnersCount() view returns (uint256)",
  "function troves(uint256 tokenId) view returns (uint256 debt, uint256 coll, uint256 stake, uint256 rewardSnapColl, uint256 rewardSnapDebt, uint8 status)",
  "function liquidate(uint256 tokenId)",
  "function batchLiquidate(uint256[] tokenIds)",
  "function getEntireDebtAndColl(address owner) view returns (uint256 debt, uint256 coll)",
];

const TROVE_NFT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenExists(uint256) view returns (bool)",
];

const PRICE_FEED_ABI = [
  "function fetchPrice() view returns (uint256)",
];

async function main() {
  console.log("🔍 FENUS Liquidation Bot");
  console.log("=".repeat(70));

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const troveManager = new ethers.Contract(TROVE_MANAGER, TROVE_MANAGER_ABI, signer);
  const troveNFT = new ethers.Contract(TROVE_NFT, TROVE_NFT_ABI, provider);
  const priceFeed = new ethers.Contract(PRICE_FEED, PRICE_FEED_ABI, provider);

  console.log("Liquidator:", signer.address);
  console.log();

  // Get current price
  console.log("📊 Fetching current wzkLTC price...");
  const priceWei = await priceFeed.fetchPrice();
  const price = parseFloat(ethers.formatUnits(priceWei, 18));
  console.log("Current Price:", price.toFixed(4), "USD/wzkLTC");
  console.log();

  // Scan for active troves
  console.log("🔎 Scanning for active troves...");
  const activeTroves = [];
  const liquidatableTroves = [];

  // First, get the total count
  const totalTroves = await troveManager.getTroveOwnersCount();
  console.log(`Total active troves: ${totalTroves.toString()}`);
  
  if (Number(totalTroves) === 0) {
    console.log("\n❌ No active troves found");
    return;
  }
  
  console.log("Fetching trove data...\n");

  // Check tokenIds 1-50 in batches
  const maxTokenId = 100; // Check more tokens
  const batchSize = 5; // Process 5 at a time to speed up
  
  for (let i = 1; i <= maxTokenId; i += batchSize) {
    const promises = [];
    
    for (let tokenId = i; tokenId < i + batchSize && tokenId <= maxTokenId; tokenId++) {
      promises.push(
        (async () => {
          try {
            const owner = await troveNFT.ownerOf(tokenId);
            const troveData = await troveManager.troves(tokenId);
            
            const debt = parseFloat(ethers.formatEther(troveData.debt));
            const coll = parseFloat(ethers.formatEther(troveData.coll));
            const status = Number(troveData.status);

            // Status: 1=Active
            if (status === 1 && debt > 0) {
              const collValue = coll * price;
              const ratio = debt > 0 ? collValue / debt : 999;

              return {
                tokenId,
                owner,
                debt: debt.toFixed(2),
                coll: coll.toFixed(4),
                collValue: collValue.toFixed(2),
                ratio: ratio.toFixed(2),
                liquidatable: ratio < MCR,
              };
            }
          } catch (e) {
            // Token doesn't exist or error
          }
          return null;
        })()
      );
    }
    
    const results = await Promise.all(promises);
    
    for (const trove of results) {
      if (trove) {
        activeTroves.push(trove);
        if (trove.liquidatable) {
          liquidatableTroves.push(trove);
        }
      }
    }
    
    // Progress
    process.stdout.write(`\r   Scanned ${Math.min(i + batchSize - 1, maxTokenId)} tokens... Found ${activeTroves.length} active`);
    
    // Stop early if we found all active troves
    if (activeTroves.length >= Number(totalTroves)) {
      break;
    }
  }

  console.log(`\r✅ Found ${activeTroves.length} active troves\n`);

  // Display all active troves
  if (activeTroves.length === 0) {
    console.log("❌ No active troves found");
    return;
  }

  console.log("📋 ACTIVE TROVES");
  console.log("=".repeat(70));
  console.log(
    "ID".padEnd(6) +
    "Owner".padEnd(44) +
    "Debt".padEnd(12) +
    "Coll".padEnd(12) +
    "Ratio".padEnd(10) +
    "Status"
  );
  console.log("-".repeat(70));

  for (const trove of activeTroves) {
    const statusIcon = trove.liquidatable ? "🔴 LIQUIDATE" : "✅ Safe";
    const ratioColor = trove.liquidatable ? "\x1b[31m" : "\x1b[32m"; // Red or Green
    const reset = "\x1b[0m";

    console.log(
      `#${trove.tokenId}`.padEnd(6) +
      `${trove.owner.slice(0, 10)}...${trove.owner.slice(-6)}`.padEnd(44) +
      `${trove.debt} FnUSD`.padEnd(12) +
      `${trove.coll} wzkLTC`.padEnd(12) +
      `${ratioColor}${(parseFloat(trove.ratio) * 100).toFixed(1)}%${reset}`.padEnd(20) +
      statusIcon
    );
  }

  console.log("=".repeat(70));
  console.log();

  // Show liquidatable troves
  if (liquidatableTroves.length === 0) {
    console.log("✅ No troves are liquidatable (all above 130% ratio)");
    return;
  }

  console.log(`🔴 LIQUIDATABLE TROVES: ${liquidatableTroves.length}`);
  console.log("=".repeat(70));

  for (const trove of liquidatableTroves) {
    console.log(`Token ID: #${trove.tokenId}`);
    console.log(`  Owner: ${trove.owner}`);
    console.log(`  Debt: ${trove.debt} FnUSD`);
    console.log(`  Collateral: ${trove.coll} wzkLTC ($${trove.collValue})`);
    console.log(`  Ratio: ${(parseFloat(trove.ratio) * 100).toFixed(1)}% (below ${MCR * 100}%)`);
    console.log();
  }

  // Ask to liquidate
  console.log("💡 To liquidate these troves, run:");
  console.log();
  
  if (liquidatableTroves.length === 1) {
    console.log(`   node contracts/scripts/liquidate.js --execute ${liquidatableTroves[0].tokenId}`);
  } else {
    const tokenIds = liquidatableTroves.map(t => t.tokenId).join(",");
    console.log(`   node contracts/scripts/liquidate.js --execute ${tokenIds}`);
  }
  console.log();

  // Check if --execute flag is present
  const args = process.argv.slice(2);
  const executeIndex = args.indexOf("--execute");
  
  if (executeIndex !== -1 && args[executeIndex + 1]) {
    const tokenIdsToLiquidate = args[executeIndex + 1].split(",").map(id => parseInt(id.trim()));
    
    console.log("⚡ EXECUTING LIQUIDATIONS");
    console.log("=".repeat(70));
    
    for (const tokenId of tokenIdsToLiquidate) {
      const trove = liquidatableTroves.find(t => t.tokenId === tokenId);
      if (!trove) {
        console.log(`⚠️  Token #${tokenId} is not liquidatable, skipping...`);
        continue;
      }

      try {
        console.log(`\n🔨 Liquidating Token #${tokenId}...`);
        console.log(`   Debt: ${trove.debt} FnUSD`);
        console.log(`   Collateral: ${trove.coll} wzkLTC`);
        
        const tx = await troveManager.liquidate(tokenId, {
          gasLimit: 500000,
        });
        
        console.log(`   TX: ${tx.hash}`);
        console.log(`   Waiting for confirmation...`);
        
        await tx.wait();
        
        console.log(`   ✅ Liquidated successfully!`);
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
    
    console.log("\n" + "=".repeat(70));
    console.log("🎉 Liquidation complete!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
