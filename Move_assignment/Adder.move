address 0x1 {
    module adder {
        use std::signer;

        struct Sum has key { value: u64 }

        public fun add(a: u64, b: u64): u64 {
            a + b
        }

        public(script) fun store_result(account: &signer, a: u64, b: u64) {
            let s = add(a, b);
            move_to(account, Sum { value: s });
        }
    }
}
