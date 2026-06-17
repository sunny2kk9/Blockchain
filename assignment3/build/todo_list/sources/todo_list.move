module todo_addr::todo_list {
    use std::signer;
    use std::string;
    use std::vector;

    /// A single task in the todo list.
    struct Task has copy, drop, store {
        id: u64,
        text: string::String,
        completed: bool,
    }

    /// The todo list resource stored under each user's account.
    struct TodoList has key {
        tasks: vector<Task>,
        next_id: u64,
    }

    /// Initialize a todo list for the caller (account).
    /// This must be called once per account.
    public entry fun init_list(account: &signer) {
        let addr = signer::address_of(account);
        if (exists<TodoList>(addr)) {
            // Already initialized; abort with code 1
            abort 1;
        };

        move_to(
            account,
            TodoList {
                tasks: vector::empty<Task>(),
                next_id: 0,
            }
        );
    }

    /// Add a new task with the given text.
    /// If the list doesn't exist yet for this user, it creates it automatically.
    public entry fun add_task(account: &signer, text: string::String) acquires TodoList {
        let addr = signer::address_of(account);

        // If user has no TodoList yet, create it.
        if (!exists<TodoList>(addr)) {
            move_to(
                account,
                TodoList {
                    tasks: vector::empty<Task>(),
                    next_id: 0,
                }
            );
        };

        let todo = borrow_global_mut<TodoList>(addr);

        let id = todo.next_id;
        todo.next_id = id + 1;

        let task = Task {
            id,
            text,
            completed: false,
        };

        vector::push_back(&mut todo.tasks, task);
    }

    /// Mark a task as completed by its id.
    /// Aborts with code 2 if task not found.
    public entry fun complete_task(account: &signer, task_id: u64) acquires TodoList {
        let addr = signer::address_of(account);
        let todo = borrow_global_mut<TodoList>(addr);

        let len = vector::length(&todo.tasks);
        let i = 0;

        while (i < len) {
            let task_ref = vector::borrow_mut(&mut todo.tasks, i);
            if (task_ref.id == task_id) {
                task_ref.completed = true;
                return;
            };
            i = i + 1;
        };

        // Task not found
        abort 2;
    }
}
