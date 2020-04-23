class RunwayHostedModel  {

    constructor(url, token) {
        this.url = url
        this.token = token
    }

    async query(input) {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`
        const result = await fetch(`${this.url}/query`, {
            method: 'POST',
            headers,
            body: JSON.stringify(input)
        })
        return result.json()
    }
}
