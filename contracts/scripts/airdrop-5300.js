/**
 * Airdrop ALL FnUSD equally to 5,300 random wallets
 * Splits entire balance evenly across all wallets
 */

import { ethers } from "ethers";
import "dotenv/config";

const RPC_URL = "https://liteforge.rpc.caldera.xyz/http";
const FNUSD_ADDRESS = "0x219F2AC287458cD58aB46ABd3cfbe451728323f4";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NUM_WALLETS = 5300;

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

async function main() {
  console.log("🚀 FnUSD Equal Distribution - 5,300 Wallets");
  console.log("=".repeat(70));

  const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
    staticNetwork: true,
    timeout: 30000,
  });
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const fnusd = new ethers.Contract(FNUSD_ADDRESS, ERC20_ABI, signer);

  console.log("Sender:", signer.address);
  console.log("FnUSD:", FNUSD_ADDRESS);

  // Check balance with retry
  console.log("\n📊 Checking balance...");
  const balance = await retryOperation(() => fnusd.balanceOf(signer.address));
  const decimals = await retryOperation(() => fnusd.decimals());
  const balanceFormatted = ethers.formatUnits(balance, decimals);
  console.log("Total Balance:", balanceFormatted, "FnUSD");

  if (balance === 0n) {
    console.error("\n❌ No FnUSD balance!");
    process.exit(1);
  }

  // Calculate amount per wallet (equal distribution)
  const amountPerWallet = balance / BigInt(NUM_WALLETS);
  const amountPerWalletFormatted = ethers.formatUnits(amountPerWallet, decimals);
  const totalToSend = amountPerWallet * BigInt(NUM_WALLETS);
  const dust = balance - totalToSend; // Remaining dust due to rounding

  console.log("\nDistribution:");
  console.log("  Total wallets:", NUM_WALLETS.toLocaleString());
  console.log("  Amount per wallet:", amountPerWalletFormatted, "FnUSD");
  console.log("  Total to distribute:", ethers.formatUnits(totalToSend, decimals), "FnUSD");
  console.log("  Dust remaining:", ethers.formatUnits(dust, decimals), "FnUSD");

  console.log("\n🎲 Generating", NUM_WALLETS.toLocaleString(), "random wallets...");
  const wallets = [];
  for (let i = 0; i < NUM_WALLETS; i++) {
    const randomWallet = ethers.Wallet.createRandom();
    wallets.push(randomWallet.address);
    
    // Progress indicator
    if ((i + 1) % 500 === 0) {
      process.stdout.write(`\r   Generated ${(i + 1).toLocaleString()}/${NUM_WALLETS.toLocaleString()} wallets...`);
    }
  }
  console.log(`\n✅ Generated ${NUM_WALLETS.toLocaleString()} random wallets\n`);

  console.log("💸 Starting airdrop...");
  console.log("=".repeat(70));
  
  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();
  let lastProgressUpdate = Date.now();

  for (let i = 0; i < wallets.length; i++) {
    const recipient = wallets[i];
    
    try {
      const tx = await retryOperation(async () => {
        return await fnusd.transfer(recipient, amountPerWallet, {
          gasLimit: 100000,
        });
      });
      
      await retryOperation(() => tx.wait());
      successCount++;
      
      // Progress update every 50 transfers or every 10 seconds
      const now = Date.now();
      if ((i + 1) % 50 === 0 || now - lastProgressUpdate > 10000) {
        const elapsed = (now - startTime) / 1000;
        const rate = successCount / elapsed;
        const remaining = wallets.length - (i + 1);
        const eta = remaining / rate;
        const percentComplete = ((i + 1) / wallets.length * 100).toFixed(1);
        
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
    if (i < wallets.length - 1 && (i + 1) % 10 === 0) {
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
  console.log("💰 Total distributed:", ethers.formatUnits(amountPerWallet * BigInt(successCount), decimals), "FnUSD");
  console.log("📊 Per wallet:", amountPerWalletFormatted, "FnUSD");
  
  // Final balance
  const finalBalance = await retryOperation(() => fnusd.balanceOf(signer.address));
  console.log("💼 Remaining balance:", ethers.formatUnits(finalBalance, decimals), "FnUSD");
  
  console.log("\n✨ Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Fatal Error:", error.message);
    console.error(error);
    process.exit(1);
  });
