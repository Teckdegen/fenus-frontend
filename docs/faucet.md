# Faucet

The **Faucet** gives you **test WzkLTC** so you can try opening and managing a Trove without bringing your own collateral.

Availability depends on deployment — some production environments may hide or disable it.

---

## Who needs it

| User | Reason |
|------|--------|
| New tester | Starts with zero **WzkLTC** |
| Demo | Quickly funds a wallet for screenshots or trials |

---

## Before claiming

| Requirement | Detail |
|-------------|--------|
| Wallet connected | Same as elsewhere in the app |
| Cooldown | Commonly **48 hours** between claims per wallet (implementation-specific) |

---

## How to claim

| Step | Action |
|------|--------|
| 1 | Go to **Faucet** in the app navigation |
| 2 | Press the claim button when enabled |
| 3 | Wait for confirmation |

Typical payout on test setups: **1,000 WzkLTC** per successful claim (confirm on your deployment).

---

## After claiming

| Next step | Where |
|-----------|--------|
| Open a Trove | **Trove → Open** |
| Check balance | **Dashboard** wallet strip |

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Button disabled | Cooldown timer — wait until it shows ready |
| Request failed | Network connection; whether faucet backend `/api/faucet` is reachable |
| Wrong network | Switch to the chain the app expects |
