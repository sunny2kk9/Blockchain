module hello_blockchain::message {
    use std::string;
    use std::signer;

    struct MessageHolder has key {
        message: string::String,
    }

    /// Initialize the message holder for the account
    public entry fun initialize(account: &signer) {
        let message_holder = MessageHolder {
            message: string::utf8(b"Hello, Blockchain!"),
        };
        move_to(account, message_holder);
    }

    /// Set a new message
    public entry fun set_message(account: &signer, message: string::String) acquires MessageHolder {
        let account_addr = signer::address_of(account);
        let message_holder = borrow_global_mut<MessageHolder>(account_addr);
        message_holder.message = message;
    }

    #[view]
    /// Get the current message
    public fun get_message(account_addr: address): string::String acquires MessageHolder {
        borrow_global<MessageHolder>(account_addr).message
    }
}
