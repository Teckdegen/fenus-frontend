/**
 * Airdrop FnUSD randomly to 5,300 wallets
 * - Keeps 1,000 FnUSD for sender
 * - Random amounts: 0.01 to 40 FnUSD per wallet
 * - Highly random distribution
 */

import { ethers } from "ethers";
import "dotenv/config";

const RPC_URL = "https://liteforge.rpc.caldera.xyz/http";
const FNUSD_ADDRESS = "0x219F2AC287458cD58aB46ABd3cfbe451728323f4";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NUM_WALLETS = 7300;
const KEEP_BALANCE = 1000; // Keep 1000 FnUSD for sender
const MIN_AMOUNT = 0.01; // Minimum per wallet
const MAX_AMOUNT = 40; // Maximum per wallet

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY not found in .env");
  process.exit(1);
}

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// Generate random amount with weighted distribution
// More wallets get smaller amounts, fewer get larger amounts
function getRandomAmount() {
  const rand = Math.random();
  
  // 40% chance: 0.01 - 1 FnUSD (small amounts)
  if (rand < 0.4) {
    return MIN_AMOUNT + Math.random() * (1 - MIN_AMOUNT);
  }
  // 30% chance: 1 - 5 FnUSD (medium amounts)
  else if (rand < 0.7) {
    return 1 + Math.random() * 4;
  }
  // 20% chance: 5 - 15 FnUSD (larger amounts)
  else if (rand < 0.9) {
    return 5 + Math.random() * 10;
  }
  // 10% chance: 15 - 40 FnUSD (whale amounts)
  else {
    return 15 + Math.random() * 25;
  }
}

async function main() {
  console.log("🚀 FnUSD Random Distribution - 7,300 Wallets");
  console.log("=".repeat(70));

  const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
    staticNetwork: true,
    timeout: 30000,
  });
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const fnusd = new ethers.Contract(FNUSD_ADDRESS, ERC20_ABI, signer);

  console.log("Sender:", signer.address);
  console.log("FnUSD:", FNUSD_ADDRESS);

  // Check balance
  console.log("\n📊 Checking balance...");
  const balance = await retryOperation(() => fnusd.balanceOf(signer.address));
  const decimals = await retryOperation(() => fnusd.decimals());
  const balanceFormatted = ethers.formatUnits(balance, decimals);
  console.log("Total Balance:", balanceFormatted, "FnUSD");

  const keepAmount = ethers.parseUnits(KEEP_BALANCE.toString(), decimals);
  const availableToDistribute = balance - keepAmount;

  if (availableToDistribute <= 0n) {
    console.error("\n❌ Not enough balance to distribute!");
    console.error("Need to keep:", KEEP_BALANCE, "FnUSD");
    process.exit(1);
  }

  const availableFormatted = ethers.formatUnits(availableToDistribute, decimals);
  console.log("Keep for sender:", KEEP_BALANCE, "FnUSD");
  console.log("Available to distribute:", availableFormatted, "FnUSD");

  // Generate random amounts for each wallet
  console.log("\n🎲 Generating", NUM_WALLETS.toLocaleString(), "random wallets with random amounts...");
  const distributions = [];
  let totalAllocated = 0;

  for (let i = 0; i < NUM_WALLETS; i++) {
    const randomWallet = ethers.Wallet.createRandom();
    const randomAmount = getRandomAmount();
    
    distributions.push({
      address: randomWallet.address,
      amount: randomAmount,
    });
    
    totalAllocated += randomAmount;
    
    // Progress indicator
    if ((i + 1) % 500 === 0) {
      process.stdout.write(`\r   Generated ${(i + 1).toLocaleString()}/${NUM_WALLETS.toLocaleString()} wallets...`);
    }
  }
  console.log(`\n✅ Generated ${NUM_WALLETS.toLocaleString()} random wallets\n`);

  // Scale amounts to fit available balance
  const scaleFactor = parseFloat(availableFormatted) / totalAllocated;
  console.log("Distribution stats:");
  console.log("  Total allocated (before scaling):", totalAllocated.toFixed(2), "FnUSD");
  console.log("  Scale factor:", scaleFactor.toFixed(4));

  // Apply scaling and convert to BigInt
  for (let i = 0; i < distributions.length; i++) {
    const scaledAmount = distributions[i].amount * scaleFactor;
    distributions[i].amountScaled = scaledAmount;
    distributions[i].amountBigInt = ethers.parseUnits(scaledAmount.toFixed(6), decimals);
  }

  // Calculate actual total
  let actualTotal = 0n;
  for (const d of distributions) {
    actualTotal += d.amountBigInt;
  }

  console.log("  Actual total to send:", ethers.formatUnits(actualTotal, decimals), "FnUSD");
  console.log("  Min amount:", Math.min(...distributions.map(d => d.amountScaled)).toFixed(6), "FnUSD");
  console.log("  Max amount:", Math.max(...distributions.map(d => d.amountScaled)).toFixed(6), "FnUSD");
  console.log("  Avg amount:", (parseFloat(ethers.formatUnits(actualTotal, decimals)) / NUM_WALLETS).toFixed(6), "FnUSD");

  console.log("\n💸 Starting airdrop...");
  console.log("=".repeat(70));
  
  let successCount = 0;
  let failCount = 0;
  let totalSent = 0n;
  const startTime = Date.now();
  let lastProgressUpdate = Date.now();

  for (let i = 0; i < distributions.length; i++) {
    const { address, amountBigInt } = distributions[i];
    
    try {
      const tx = await retryOperation(async () => {
        return await fnusd.transfer(address, amountBigInt, {
          gasLimit: 100000,
        });
      });
      
      await retryOperation(() => tx.wait());
      successCount++;
      totalSent += amountBigInt;
      
      // Progress update every 50 transfers or every 10 seconds
      const now = Date.now();
      if ((i + 1) % 50 === 0 || now - lastProgressUpdate > 10000) {
        const elapsed = (now - startTime) / 1000;
        const rate = successCount / elapsed;
        const remaining = distributions.length - (i + 1);
        const eta = remaining / rate;
        const percentComplete = ((i + 1) / distributions.length * 100).toFixed(1);
        
        process.stdout.write(
          `\r[${i + 1}/${NUM_WALLETS}] ${percentComplete}% ` +
          `✅ ${successCount.toLocaleString()} ` +
          `❌ ${failCount} ` +
          `⚡ ${rate.toFixed(1)}/s ` +
          `⏱️  ETA ${Math.floor(eta / 60)}m ${Math.floor(eta % 60)}s   `
        );
        lastProgressUpdate = now;
      }
      
    } catch (error) {
      failCount++;
      
      // Log errors but continue
      if (failCount % 10 === 0) {
        console.log(`\n⚠️  ${failCount} failures so far (continuing...)`);
      }
    }

    // Small delay to avoid overwhelming the RPC
    if (i < distributions.length - 1 && (i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  const totalTime = (Date.now() - startTime) / 1000;
  
  console.log("\n" + "=".repeat(70));
  console.log("🎉 Airdrop Complete!");
  console.log("=".repeat(70));
  console.log("✅ Success:", successCount.toLocaleString(), "wallets");
  console.log("❌ Failed:", failCount.toLocaleString(), "wallets");
  console.log("⏱️  Total time:", Math.floor(totalTime / 60), "minutes", Math.floor(totalTime % 60), "seconds");
  console.log("⚡ Average rate:", (successCount / totalTime).toFixed(2), "tx/s");
  console.log("💰 Total distributed:", ethers.formatUnits(totalSent, decimals), "FnUSD");
  console.log("📊 Avg per wallet:", (parseFloat(ethers.formatUnits(totalSent, decimals)) / successCount).toFixed(6), "FnUSD");
  
  // Final balance
  const finalBalance = await retryOperation(() => fnusd.balanceOf(signer.address));
  console.log("💼 Your remaining balance:", ethers.formatUnits(finalBalance, decimals), "FnUSD");
  
  console.log("\n✨ Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Fatal Error:", error.message);
    console.error(error);
    process.exit(1);
  });
