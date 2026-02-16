export class AtomicInteger {
    constructor(initialValue = 0) {
        this.buffer = new SharedArrayBuffer(4);
        this.arr = new Int32Array(this.buffer);
        Atomics.store(this.arr, 0, initialValue);
    }

    // Atomically increments the integer and returns the new value
    incrementAndGet() {
        return Atomics.add(this.arr, 0, 1) + 1;
    }

    // Atomically sets and returns the new value
    setAndGet(newValue) {
        Atomics.store(this.arr, 0, newValue);
        return newValue;
    }

    // Atomically gets the current value
    get() {
        return Atomics.load(this.array, 0);
    }
}