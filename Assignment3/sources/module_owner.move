module module_owner::dice {
    use std::signer;
    use std::vector;
    use aptos_framework::randomness;

    /// Stores all dice rolls for a user
    struct DiceRollHistory has key {
        rolls: vector<u64>,
    }

    /// Basic dice roll using unsafe randomness (not secure)
    #[lint::allow_unsafe_randomness]
    public entry fun roll_v0(_account: signer) {
        let _ = randomness::u64_range(0, 6); // Generates number between 0–5
    }

    /// Secure dice roll that stores the user's roll history
    #[randomness]
    entry fun roll(account: signer) acquires DiceRollHistory {
        let addr = signer::address_of(&account);

        // Load existing history or create new one
        let history = if (exists<DiceRollHistory>(addr)) {
            move_from<DiceRollHistory>(addr)
        } else {
            DiceRollHistory { rolls: vector[] }
        };

        // Generate a new random number (0–5)
        let new_roll = randomness::u64_range(0, 6);
        vector::push_back(&mut history.rolls, new_roll);

        // Save updated roll history back to the user's account
        move_to(&account, history);
    }

    /// Controlled randomness execution with gas limit
    #[randomness(max_gas = 56789)]
    entry fun roll_v2(_account: signer) {
        let _ = randomness::u64_range(0, 6);
    }
}
