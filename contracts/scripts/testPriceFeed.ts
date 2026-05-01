import { ethers } from "hardhat";
import "dotenv/config";

// DIA Chainlink-adapter oracle for LTC/USD on LitVM LiteForge
const DIA_ADAPTER = "0x45dDa5d881BD2C917976CCfde74fFd6f6412da29";

// Chainlink AggregatorV3 interface (DIA LitVM adapters implement this)
const ADAPTER_ABI = [
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)",
];

async function main() {
  const [signer] = await ethers.getSigners();

  console.log("\n══════════════════════════════════════════");
  console.log("  DIA Price Feed Test — LitVM LiteForge");
  console.log("══════════════════════════════════════════");
  console.log(`  Adapter : ${DIA_ADAPTER}`);
  console.log(`  Wallet  : ${signer.address}`);
  console.log("══════════════════════════════════════════\n");

  // ── 1. Call DIA adapter directly ─────────────────────────────────────────
  console.log("1. Calling DIA adapter (latestRoundData)...");
  const adapter = new ethers.Contract(DIA_ADAPTER, ADAPTER_ABI, signer);

  try {
    const decimals = await adapter.decimals();
    console.log(`   Decimals : ${decimals}`);

    const [roundId, answer, , updatedAt] = await adapter.latestRoundData();

    const answerNum    = Number(answer);
    const updatedAtNum = Number(updatedAt);
    const age          = Math.floor(Date.now() / 1000) - updatedAtNum;
    const ageMinutes   = (age / 60).toFixed(1);

    // DIA LitVM adapters return 18-decimal prices
    const priceUSD = Number(ethers.formatUnits(answer, decimals));

    console.log(`   Round ID          : ${roundId}`);
    console.log(`   Raw answer        : ${answerNum}`);
    console.log(`   Price LTC/USD     : $${priceUSD.toFixed(4)}`);
    console.log(`   Last updated      : ${new Date(updatedAtNum * 1000).toISOString()}`);
    console.log(`   Age               : ${ageMinutes} minutes ago`);

    if (age > 3600) {
      console.log(`   ⚠️  Price is stale (>1 hour) — PriceFeed will reject this`);
    } else {
      console.log(`   ✅ Price is fresh`);
    }

  } catch (err: any) {
    console.error(`   ❌ Adapter call failed: ${err.message}`);
    process.exit(1);
  }

  // ── 2. Deploy PriceFeed and call fetchPrice ───────────────────────────────
  console.log("\n2. Deploying PriceFeed and calling fetchPrice...");

  try {
    const PriceFeed = await ethers.getContractFactory("PriceFeed");
    const priceFeed = await PriceFeed.deploy(DIA_ADAPTER, ethers.ZeroAddress);
    await priceFeed.waitForDeployment();
    console.log(`   PriceFeed deployed: ${await priceFeed.getAddress()}`);

    const result = await priceFeed.fetchPrice.staticCall();
    const price18 = result[0];
    const isLive  = result[1];
    const priceUSD = Number(ethers.formatEther(price18));

    console.log(`   fetchPrice() price: $${priceUSD.toFixed(4)}`);
    console.log(`   isLive            : ${isLive}`);
    console.log(`   lastGoodPrice     : $${Number(ethers.formatEther(await priceFeed.getLastGoodPrice())).toFixed(4)}`);
    console.log(`   status            : ${await priceFeed.status()} (0=Live, 1=ShutdownGrace, 2=Shutdown)`);

    if (isLive) {
      console.log(`\n   ✅ PriceFeed working — LTC/USD = $${priceUSD.toFixed(4)}`);
    } else {
      console.log(`\n   ⚠️  isLive=false — price may be stale or oracle down`);
    }

  } catch (err: any) {
    console.error(`   ❌ PriceFeed test failed: ${err.message}`);
    process.exit(1);
  }

  console.log("\n══════════════════════════════════════════");
  console.log("  Test complete — ready to deploy");
  console.log("══════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
