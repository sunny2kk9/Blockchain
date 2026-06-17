module Move_Assignment::calculator {
    use std::signer;

    struct Result has key {
        value: u64
    }

    public fun add(a: u64, b: u64): u64 {
        a + b
    }

    public fun subtract(a: u64, b: u64): u64 {
        if (a > b) {
            a - b
        } else {
            b - a
        }
    }

    public entry fun store_add_result(account: &signer, a: u64, b: u64) {
        let r = add(a, b);
        move_to(account, Result { value: r });
    }

    public entry fun store_sub_result(account: &signer, a: u64, b: u64) {
        let r = subtract(a, b);
        move_to(account, Result { value: r });
    }

    public fun get_result(addr: address): u64 acquires Result {
        borrow_global<Result>(addr).value
    }
}
