module 0xc3ef486b41dcfc6648504b45f1ca847321e6e0d2f12849e78175c2c06d18992e::devcon_events { // Replace 0x1 with your address or a named address
    use std::string::{String};
    use std::vector;
    use std::signer;

    // Error constants
    const EVENT_LIST_EXISTS: u64 = 201;
    const EVENT_LIST_NOT_EXISTS: u64 = 202;

    // Struct to hold the list of events (Resource)
    struct DevconEventList has key {
        events: vector<DevconEvent>,
        event_counter: u64,
    }

    // Struct for a single event (Not a Resource, has copy/drop)
    struct DevconEvent has store, copy, drop {
        id: u64,
        name: String,
        description: String,
        attending: bool,
    }

    // Function 1: Create the event list resource
    public entry fun create_event_list(caller: &signer) {
        let caller_addr = signer::address_of(caller);
        // Assert list doesn't already exist
        assert!(!exists<DevconEventList>(caller_addr), EVENT_LIST_EXISTS);

        // Move the empty resource to the caller's account
        move_to(caller, DevconEventList {
            events: vector::empty(),
            event_counter: 0
        });
    }

    // Function 2: Add an event to the list
    public entry fun add_event(caller: &signer, name: String, description: String) acquires DevconEventList {
        let caller_addr = signer::address_of(caller);
        // Assert list exists
        assert!(exists<DevconEventList>(caller_addr), EVENT_LIST_NOT_EXISTS);

        // Borrow mutable reference to the resource
        let event_list = borrow_global_mut<DevconEventList>(caller_addr);
        
        // Create new event
        let new_id = event_list.event_counter + 1;
        let new_event = DevconEvent {
            id: new_id,
            name: name,
            description: description,
            attending: false, // Default to false
        };

        // Push to vector and increment counter
        vector::push_back(&mut event_list.events, new_event);
        event_list.event_counter = new_id;
    }
}