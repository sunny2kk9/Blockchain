module adder_addr::Adder {

    use std::signer;

    // A resource struct to store the result on the account
    struct Sum has key {
        value: u64,
    }

    // Pure function: Calculates sum, returns value (no transaction needed)
    public fun add(a: u64, b: u64): u64 {
        a + b
    }

    // Entry function: Calculates sum and stores the result on the signer's account
    public entry fun store_result(account: &signer, a: u64, b: u64) {
        let result = a + b;
        let addr = signer::address_of(account);

        if (!exists<Sum>(addr)) {
            move_to(account, Sum { value: result });
        } else {
            let old = borrow_global_mut<Sum>(addr);
            old.value = result;
        }
    }
}