// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AddressesRegistry} from "../src/AddressesRegistry.sol";
import {IAddressesRegistry} from "../src/interfaces/IAddressesRegistry.sol";
import {WzkLTC} from "../src/WzkLTC.sol";
import {FnUSD} from "../src/FnUSD.sol";
import {PriceFeed} from "../src/PriceFeed.sol";
import {ActivePool} from "../src/ActivePool.sol";
import {DefaultPool} from "../src/DefaultPool.sol";
import {CollSurplusPool} from "../src/CollSurplusPool.sol";
import {GasPool} from "../src/GasPool.sol";
import {SortedTroves} from "../src/SortedTroves.sol";
import {TroveManager} from "../src/TroveManager.sol";
import {BorrowerOperations} from "../src/BorrowerOperations.sol";
import {RedemptionHelper} from "../src/RedemptionHelper.sol";
import {HintHelpers} from "../src/HintHelpers.sol";
import {CollateralRegistry} from "../src/CollateralRegistry.sol";
import {Constants} from "../src/Constants.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ─── Configuration — fill these before deploying ─────────────────────────────
//
// PRIMARY_ORACLE   : Chainlink-style zkLTC/USD price feed address on your chain
// FALLBACK_ORACLE  : Secondary oracle (set to address(0) if none available yet)
// TREASURY         : Your treasury wallet — receives origination fees, redemption fees, liquidation surplus
// DEPLOYER         : The wallet running this script (msg.sender)
//
// Set via environment variables:
//   PRIMARY_ORACLE=0x...
//   FALLBACK_ORACLE=0x...   (or 0x0000...0000 for none)
//   TREASURY=0x...
// ---------------------------------------------------------------------------

contract Deploy is Script {
    function run() external {
        // ── Read config from env ──────────────────────────────────────────────
        address primaryOracle  = vm.envAddress("PRIMARY_ORACLE");
        address fallbackOracle = vm.envOr("FALLBACK_ORACLE", address(0));
        address treasury       = vm.envAddress("TREASURY");
        address deployer       = msg.sender;

        console.log("Deployer  :", deployer);
        console.log("Treasury  :", treasury);
        console.log("Oracle    :", primaryOracle);

        vm.startBroadcast();

        // ── 1. AddressesRegistry — deploy first, frozen after setAddresses ───
        AddressesRegistry registry = new AddressesRegistry();
        console.log("AddressesRegistry :", address(registry));

        // ── 2. WzkLTC — collateral token ─────────────────────────────────────
        WzkLTC wzkLTC = new WzkLTC(deployer);
        console.log("WzkLTC            :", address(wzkLTC));

        // ── 3. FnUSD — stablecoin ─────────────────────────────────────────────
        FnUSD fnUSD = new FnUSD(registry);
        console.log("FnUSD             :", address(fnUSD));

        // ── 4. PriceFeed ──────────────────────────────────────────────────────
        PriceFeed priceFeed = new PriceFeed(primaryOracle, fallbackOracle);
        console.log("PriceFeed         :", address(priceFeed));

        // ── 5. Pools ──────────────────────────────────────────────────────────
        ActivePool activePool = new ActivePool(registry, IERC20(address(wzkLTC)));
        console.log("ActivePool        :", address(activePool));

        DefaultPool defaultPool = new DefaultPool(registry, IERC20(address(wzkLTC)));
        console.log("DefaultPool       :", address(defaultPool));

        CollSurplusPool collSurplusPool = new CollSurplusPool(registry, IERC20(address(wzkLTC)));
        console.log("CollSurplusPool   :", address(collSurplusPool));

        GasPool gasPool = new GasPool(registry);
        console.log("GasPool           :", address(gasPool));

        // ── 6. SortedTroves ───────────────────────────────────────────────────
        SortedTroves sortedTroves = new SortedTroves(registry);
        console.log("SortedTroves      :", address(sortedTroves));

        // ── 7. Core logic ─────────────────────────────────────────────────────
        TroveManager troveManager = new TroveManager(registry);
        console.log("TroveManager      :", address(troveManager));

        BorrowerOperations borrowerOps = new BorrowerOperations(registry);
        console.log("BorrowerOperations:", address(borrowerOps));

        RedemptionHelper redemptionHelper = new RedemptionHelper(registry);
        console.log("RedemptionHelper  :", address(redemptionHelper));

        // ── 8. Helpers ────────────────────────────────────────────────────────
        HintHelpers hintHelpers = new HintHelpers(registry);
        console.log("HintHelpers       :", address(hintHelpers));

        CollateralRegistry collateralRegistry = new CollateralRegistry(deployer);
        console.log("CollateralRegistry:", address(collateralRegistry));

        // ── 9. Wire everything together — freeze the registry ─────────────────
        IAddressesRegistry.Addresses memory addrs = IAddressesRegistry.Addresses({
            collateralToken:    address(wzkLTC),
            fnUSD:              address(fnUSD),
            priceFeed:          address(priceFeed),
            borrowerOperations: address(borrowerOps),
            troveManager:       address(troveManager),
            sortedTroves:       address(sortedTroves),
            activePool:         address(activePool),
            defaultPool:        address(defaultPool),
            collSurplusPool:    address(collSurplusPool),
            gasPool:            address(gasPool),
            treasury:           treasury,
            redemptionHelper:   address(redemptionHelper),
            hintHelpers:        address(hintHelpers),
            collateralRegistry: address(collateralRegistry)
        });

        registry.setAddresses(addrs);
        console.log("Registry frozen   : true");

        // ── 10. Register WzkLTC in CollateralRegistry ─────────────────────────
        collateralRegistry.addCollateral(
            IERC20(address(wzkLTC)),
            Constants.MCR,
            address(registry)
        );
        console.log("Collateral registered: WzkLTC @ 130% MCR");

        vm.stopBroadcast();

        // ── Summary ───────────────────────────────────────────────────────────
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("AddressesRegistry :", address(registry));
        console.log("WzkLTC            :", address(wzkLTC));
        console.log("FnUSD             :", address(fnUSD));
        console.log("PriceFeed         :", address(priceFeed));
        console.log("ActivePool        :", address(activePool));
        console.log("DefaultPool       :", address(defaultPool));
        console.log("CollSurplusPool   :", address(collSurplusPool));
        console.log("GasPool           :", address(gasPool));
        console.log("SortedTroves      :", address(sortedTroves));
        console.log("TroveManager      :", address(troveManager));
        console.log("BorrowerOperations:", address(borrowerOps));
        console.log("RedemptionHelper  :", address(redemptionHelper));
        console.log("HintHelpers       :", address(hintHelpers));
        console.log("CollateralRegistry:", address(collateralRegistry));
        console.log("Treasury          :", treasury);
    }
}
