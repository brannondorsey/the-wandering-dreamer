class RunwayModel  {

    constructor(socketIOLocation) {
        this.socket = io(socketIOLocation)
        this.callbacks = []
        this.errorCallbacks = []
        this.socket.on('data', (data) => {
            this.callbacks.forEach(cb => cb(data))
        })
        this.socket.on('error', (err) => {
            this.errorCallbacks.forEach(cb => cb(err))
        })
    }

    input(data) {
        this.socket.emit('query', data)
    }

    output(cb) {
        this.callbacks.push(cb)
    }

    netError(cb) {
        this.errorCallbacks.push(cb)
    }
}
