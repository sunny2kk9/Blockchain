module Counter::counter {
    use std::signer;

    struct Counter has key {
        value: u64
    }

    public entry fun init(account: &signer) {
        move_to(account, Counter { value: 0 });
    }

    public entry fun increment(account: &signer) acquires Counter {
        let addr = signer::address_of(account);
        let c_ref = borrow_global_mut<Counter>(addr);
        c_ref.value = c_ref.value + 1;
    }

    public fun get(addr: address): u64 acquires Counter {
        borrow_global<Counter>(addr).value
    }
}
