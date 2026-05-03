/**
 * Airdrop FnUSD to 100 random wallets
 * Sends 0.000001 FnUSD to each wallet (minimum amount)
 */

import { ethers } from "ethers";
import "dotenv/config";

const RPC_URL = "https://liteforge.rpc.caldera.xyz/http";
const FNUSD_ADDRESS = "0x219F2AC287458cD58aB46ABd3cfbe451728323f4";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY not found in .env");
  process.exit(1);
}

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

async function main() {
  console.log("🚀 FnUSD Airdrop Script");
  console.log("=".repeat(60));

  const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
    staticNetwork: true,
    timeout: 30000,
  });
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const fnusd = new ethers.Contract(FNUSD_ADDRESS, ERC20_ABI, signer);

  console.log("Sender:", signer.address);
  console.log("FnUSD:", FNUSD_ADDRESS);

  // Check balance with retry
  console.log("Checking balance...");
  let balance, decimals;
  for (let i = 0; i < 3; i++) {
    try {
      balance = await fnusd.balanceOf(signer.address);
      decimals = await fnusd.decimals();
      break;
    } catch (e) {
      if (i === 2) throw e;
      console.log(`Retry ${i + 1}/3...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  const balanceFormatted = ethers.formatUnits(balance, decimals);
  console.log("Balance:", balanceFormatted, "FnUSD");

  const amountPerWallet = ethers.parseUnits("0.000001", decimals); // 0.000001 FnUSD
  const numWallets = 100;
  const totalNeeded = amountPerWallet * BigInt(numWallets);

  console.log("\nAmount per wallet:", ethers.formatUnits(amountPerWallet, decimals), "FnUSD");
  console.log("Total wallets:", numWallets);
  console.log("Total needed:", ethers.formatUnits(totalNeeded, decimals), "FnUSD");

  if (balance < totalNeeded) {
    console.error("\n❌ Insufficient balance!");
    process.exit(1);
  }

  console.log("\n🎲 Generating 100 random wallets...");
  const wallets = [];
  for (let i = 0; i < numWallets; i++) {
    const randomWallet = ethers.Wallet.createRandom();
    wallets.push(randomWallet.address);
  }
  console.log("✅ Generated 100 random wallets");

  console.log("\n💸 Starting airdrop...");
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < wallets.length; i++) {
    const recipient = wallets[i];
    try {
      process.stdout.write(`[${i + 1}/${numWallets}] Sending to ${recipient.slice(0, 10)}... `);
      
      const tx = await fnusd.transfer(recipient, amountPerWallet);
      await tx.wait();
      
      console.log("✅");
      successCount++;
    } catch (error) {
      console.log(`❌ ${error.message}`);
      failCount++;
    }

    // Small delay to avoid rate limiting
    if (i < wallets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Airdrop Complete!");
  console.log("=".repeat(60));
  console.log("✅ Success:", successCount);
  console.log("❌ Failed:", failCount);
  console.log("💰 Total sent:", ethers.formatUnits(amountPerWallet * BigInt(successCount), decimals), "FnUSD");
  
  // Final balance
  const finalBalance = await fnusd.balanceOf(signer.address);
  console.log("📊 Remaining balance:", ethers.formatUnits(finalBalance, decimals), "FnUSD");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
