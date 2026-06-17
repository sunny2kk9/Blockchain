## Contract Details

**Deployed Address:** `0xfb24b9c6188adace724d44ea15ad560f5b4aa5f67c51672f7fe910cc2e617f2`

**Network:** Aptos Devnet

**Explorer Link:** [View Transaction on Aptos Explorer](https://explorer.aptoslabs.com/txn/0xa5020392320445c49a930b4de75c11827e49800968fb5199f1b881a754a87f1a?network=devnet)

## Project Structure

```
Assignment3/
├── Move.toml              # Project configuration
├── sources/               # Source code directory
│   └── module_owner.move  # Main module
├── tests/                 # Test files
├── scripts/               # Deployment scripts
└── build/                 # Build artifacts
```

## Prerequisites

- [Aptos CLI](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/)

## Installation

1. Clone the repository
2. Navigate to the Assignment3 directory
3. Build the project:
   ```bash
   aptos move compile
   ```

## Deployment

The contract has been deployed using the following command:

```bash
aptos move deploy-object --address-name module_owner
```

## Usage

To interact with the deployed contract, you can use the Aptos CLI or SDK with the contract address provided above.

