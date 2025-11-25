module multiply_contract::multiply {
    use std::signer;

    struct Product has key { value: u64 }

    public fun multiply(a: u64, b: u64): u64 {
        a * b
    }

    public entry fun store_result(account: &signer, a: u64, b: u64) {
        let p = multiply(a, b);
        move_to(account, Product { value: p });
    }
}
