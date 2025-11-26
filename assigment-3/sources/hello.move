module project::hello {
    public entry fun set_value(x: u64) {
        // simple no-op function that just "uses" the argument
        let _ = x;
    }
}
