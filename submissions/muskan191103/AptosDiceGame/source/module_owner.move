module module_owner::dice_game {
    use std::signer;
    use std::vector;
    use aptos_framework::randomness;

    /// Stores all dice rolls for a specific user
    struct RollLog has key {
        history: vector<u64>,
    }

    /// Basic roll (unsafe randomness allowed)
    #[lint::allow_unsafe_randomness]
    public entry fun basic_roll(_user: signer) {
        let _unused = randomness::u64_range(0, 6);
    }

    /// Main dice roll function — saves roll history
    #[randomness]
    entry fun roll(user: signer) acquires RollLog {
        let user_addr = signer::address_of(&user);

        // Load existing history or create new
        let mut logs = if (exists<RollLog>(user_addr)) {
            move_from<RollLog>(user_addr)
        } else {
            RollLog { history: vector[] }
        };

        // Generate random number from 0–5
        let result = randomness::u64_range(0, 6);
        vector::push_back(&mut logs.history, result);

        // Save back to storage
        move_to(&user, logs);
    }

    /// Roll version 2 — randomness with limited gas
    #[randomness(max_gas = 56789)]
    entry fun roll_v2(_user: signer) {
        let _discard = randomness::u64_range(0, 6);
    }
}