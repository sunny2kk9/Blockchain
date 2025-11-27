# Deploy instructions (Aptos devnet)

These instructions publish the `move_sample` package to Aptos devnet using the `aptos` CLI.

Prerequisites:
- Install `aptos` CLI: see https://aptos.dev/ (or install via your preferred package manager).
- Make sure `aptos` is on your PATH.

Quick commands (PowerShell):

```powershell
# generate a new keypair and save accounts to a directory
aptos key generate --output-file keys.json

# create an account on devnet and print the account address
aptos account create --private-key-file keys.json --chain devnet

# fund account from devnet faucet (opens URL to get tokens)
echo "Open the Aptos devnet faucet and fund the created address."

# change into package dir and publish
Set-Location -Path .\move_sample
aptos move compile
aptos move publish --package-dir . --assume-yes --profile devnet

# note: after publish, capture your account address and the transaction hash.
```

If you'd like, I can attempt to run these steps here (installing `aptos` CLI if missing) and publish the sample. Reply "Proceed with deploy" to let me install the CLI and run the deployment from this machine.
