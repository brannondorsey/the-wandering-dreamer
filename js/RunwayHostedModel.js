class RunwayHostedModel  {

    constructor(url, token) {
        this.url = url
        this.token = token
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        if (this.token) this.headers['Authorization'] = `Bearer ${this.token}`
    }

    async awaken(waitUntilAwake = false) {
        while (!this.isAwake() && waitUntilAwake) {
            await delay(1000)
        }
    }

    async isAwake() {
        const root = await this.root()
        return root.status === 'running'
    }

    async root() {
        const result = await fetch(`${this.url}/`, {
            method: 'GET',
            headers: this.headers,
        })
        return result.json()
    }

    async info() {
        const result = await fetch(`${this.url}/info`, {
            method: 'GET',
            headers: this.headers,
        })
        return result.json()
    }

    async query(input) {
        const result = await fetch(`${this.url}/query`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(input)
        })
        return result.json()
    }
}

function delay(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
}
