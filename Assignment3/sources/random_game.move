module module_owner::random_game {
    use std::signer::address_of;
    use std::vector;
    use aptos_framework::randomness;

    // Stores the history of random number generations for each user
    struct GameHistory has key {
        results: vector<u64>,
    }

    // Initial version - basic random number generation without storage
    #[lint::allow_unsafe_randomness]
    public entry fun generate_random_v1(_user: signer) {
        let _ = randomness::u64_range(0, 6);
    }

    // Main function to generate and store random numbers
    #[randomness]
    entry fun generate_number(user: signer) acquires GameHistory {
        let user_address = address_of(&user);
        let history = if (exists<GameHistory>(user_address)) {
            move_from<GameHistory>(user_address)
        } else {
            GameHistory { results: vector[] }
        };
        let random_value = randomness::u64_range(0, 6);
        vector::push_back(&mut history.results, random_value);
        move_to(&user, history);
    }

    // Optimized version with custom gas limit
    #[randomness(max_gas=56789)]
    entry fun generate_random_v2(_user: signer) {
        let _ = randomness::u64_range(0, 6);
    }
}