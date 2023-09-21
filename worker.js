setInterval(() => {
    const randomFn = () => {
        return crypto.randomUUID();
    }
    self.postMessage(randomFn());
}, 1);