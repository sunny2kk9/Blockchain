# Blockchain Assignment

## Move Smart Contract Deployment

**Contract Address:** `0x1188ef4473955d770d19bcc6c252ae6dc8c2c8a091d7d05f1ffcd1124be08843`

**Transaction Hash:** `0x52fd94b72e6097b2a32835684394087733da68e6defa4881728e143dfef66a05`

**Explorer Link:** [View on Aptos Explorer](https://explorer.aptoslabs.com/txn/0x52fd94b72e6097b2a32835684394087733da68e6defa4881728e143dfef66a05?network=devnet)

**Account Explorer:** [View Account](https://explorer.aptoslabs.com/account/0x1188ef4473955d770d19bcc6c252ae6dc8c2c8a091d7d05f1ffcd1124be08843?network=devnet)

---

## Contract Details

**Network:** Aptos Devnet

**Module:** `product_math::product_math`

**Functions:**

- `product(x: u64, y: u64): u64` – Multiplies two u64 numbers and returns the result  
- `save_product(user: &signer, x: u64, y: u64)` – Stores the multiplication result on-chain as a resource  

**Gas Used:** 1877 units

**Deployment Status:** ✅ Successfully deployed

---

## Source Code

The contract source code is available in [`sources/product_math.move`](sources/product_math.move)

```move
module 0x1188ef4473955d770d19bcc6c252ae6dc8c2c8a091d7d05f1ffcd1124be08843::product_math {

    use std::signer;

    struct StoredProduct has key {
        value: u64,
    }

    public fun product(x: u64, y: u64): u64 {
        x * y
    }

    public fun save_product(user: &signer, x: u64, y: u64) {
        let result = x * y;
        let addr = signer::address_of(user);

        if (!exists<StoredProduct>(addr)) {
            move_to(user, StoredProduct { value: result });
        } else {
            move_to(user, StoredProduct { value: result });
        };
    }
}
