module blockassign::my_module {
    use std::signer;

    struct Store has key {
        value: u64,
    }

    public entry fun init(account: &signer) {
        move_to(account, Store { value: 0 });
    }

    public entry fun set_number(account: &signer, new_value: u64) acquires Store {
        let store = borrow_global_mut<Store>(signer::address_of(account));
        store.value = new_value;
    }

    public fun get_number(account: address): u64 acquires Store {
        borrow_global<Store>(account).value
    }
}
