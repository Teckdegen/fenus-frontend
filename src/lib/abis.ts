// Contract ABIs — minimal surfaces needed by the frontend
// Full ABIs are in contracts/artifacts after running: cd contracts && npm run compile

export const BORROWER_OPERATIONS_ABI = [
  // Open Trove
  "function openTrove(uint256 collAmount, uint256 fnUSDAmount6, address upperHint, address lowerHint) external",
  // Adjust
  "function addColl(uint256 collAmount, address upperHint, address lowerHint) external",
  "function withdrawColl(uint256 collAmount, address upperHint, address lowerHint) external",
  "function withdrawFnUSD(uint256 fnUSDAmount6, address upperHint, address lowerHint) external",
  "function repayFnUSD(uint256 fnUSDAmount6, address upperHint, address lowerHint) external",
  // Close
  "function closeTrove() external",
  "function claimCollateral() external",
] as const;

export const TROVE_MANAGER_ABI = [
  "function getTroveStatus(address owner) view returns (uint8)",
  "function getTroveColl(address owner) view returns (uint256)",
  "function getTroveDebt(address owner) view returns (uint256)",
  "function getCurrentICR(address owner, uint256 price) view returns (uint256)",
  "function getNominalICR(address owner) view returns (uint256)",
  "function getEntireDebtAndColl(address owner) view returns (uint256 debt, uint256 coll)",
  "function getTroveOwnersCount() view returns (uint256)",
  "function liquidate(address owner) external",
  "function batchLiquidate(address[] calldata owners) external",
] as const;

export const FNUSD_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)",
] as const;

export const WZKLITECOIN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)",
  "function wrap() external payable",
  "function unwrap(uint256 amount) external",
  "function adminMint(address to, uint256 amount) external",
] as const;

export const PRICE_FEED_ABI = [
  "function getLastGoodPrice() view returns (uint256)",
  "function fetchPrice() external returns (uint256 price18, bool isLive)",
  "function status() view returns (uint8)",
] as const;

export const REDEMPTION_HELPER_ABI = [
  "function redeem(uint256 fnUSDAmount6, address firstHint, uint256 maxIterations) external returns (uint256 collateralOut)",
  "function getRedemptionFeeRate() view returns (uint256)",
  "function getRedemptionRateWithDecay() view returns (uint256)",
  "function baseRate() view returns (uint256)",
] as const;

export const HINT_HELPERS_ABI = [
  "function getApproxHint(uint256 targetNICR, uint256 numTrials, uint256 inputRandomSeed) view returns (address hintAddress, uint256 diff, uint256 latestRandomSeed)",
  "function computeNominalCR(uint256 coll, uint256 debt) pure returns (uint256)",
  "function computeCR(uint256 coll, uint256 debt, uint256 price) pure returns (uint256)",
] as const;

export const SORTED_TROVES_ABI = [
  "function getSize() view returns (uint256)",
  "function getLast() view returns (address)",
  "function getFirst() view returns (address)",
  "function getNext(address owner) view returns (address)",
  "function getPrev(address owner) view returns (address)",
  "function contains(address owner) view returns (bool)",
] as const;

export const ACTIVE_POOL_ABI = [
  "function getCollateral() view returns (uint256)",
  "function getDebt() view returns (uint256)",
] as const;

export const DEFAULT_POOL_ABI = [
  "function getCollateral() view returns (uint256)",
  "function getDebt() view returns (uint256)",
] as const;
