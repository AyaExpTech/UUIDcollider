self.addEventListener("message", event => {
    if (event.data.length != new Set(event.data).size) {
        self.postMessage(true);
    }
});