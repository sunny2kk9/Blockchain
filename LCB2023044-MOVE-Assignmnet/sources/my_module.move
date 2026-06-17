module adder_addr::hello {
    use std::string;
    use std::signer;

    struct Message has key {
        text: string::String
    }

    public entry fun set_message(account: &signer, message: string::String) {
        let addr = signer::address_of(account);
        
        if (exists<Message>(addr)) {
            let msg = borrow_global_mut<Message>(addr);
            msg.text = message;
        } else {
            move_to(account, Message { text: message });
        }
    }

    #[view]
    public fun get_message(addr: address): string::String acquires Message {
        if (exists<Message>(addr)) {
            *&borrow_global<Message>(addr).text
        } else {
            string::utf8(b"No message found")
        }
    }
}
