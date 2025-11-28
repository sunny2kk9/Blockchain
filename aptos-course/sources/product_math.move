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
