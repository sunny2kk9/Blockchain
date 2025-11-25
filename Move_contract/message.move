module 0xf4cf9add7bf7fd6e3628016e772d3766f65e80234ddfc16e08aac51afc07f0f6::message {
    use std::string;
    use std::signer;

    struct Message has key {
        value: string::String,
    }

    public entry fun set_message(account: &signer, msg: string::String) {
        move_to(account, Message { value: msg });
    }

    public fun get_message(addr: address): string::String acquires Message {
        borrow_global<Message>(addr).value
    }
}
