## Smart Contract Information

**Contract Address:** `0xfb24b9c6188adace724d44ea15ad560f5b4aa5f67c51672f7fe910cc2e617f2`

**Blockchain:** Aptos Devnet

**Transaction Details:** [View on Aptos Explorer](https://explorer.aptoslabs.com/txn/0xa5020392320445c49a930b4de75c11827e49800968fb5199f1b881a754a87f1a?network=devnet)

## Directory Layout

```
Assignment3/
├── Move.toml              # Move package configuration
├── sources/               # Move source files
│   └── random_game.move  # Random game module implementation
├── tests/                 # Unit tests
├── scripts/               # Deployment and interaction scripts
└── build/                 # Compiled artifacts
```

## Requirements

- [Aptos CLI](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/) installed and configured

## Setup Instructions

1. Clone or download this repository
2. Open the Assignment3 folder in your terminal
3. Compile the Move module:
   ```bash
   aptos move compile
   ```

## Deploying the Contract

The smart contract was deployed with this command:

```bash
aptos move deploy-object --address-name module_owner
```

## How to Use

You can interact with this contract using the Aptos CLI tools or any Aptos SDK. Use the contract address shown above for all interactions.

