export default class WebCache {
    url = '';

    constructor(url) {
        this.url = url;
    }

    async getPods() {
        const data = await fetch(`${this.url}/get-pods`);
        return await data.json();
    }

    async getPodIndex(pod, tableName) {
        const data = await fetch(`${this.url}/get-pod-index?pod=${pod}&table_name=${tableName}`);
        return await data.json();
    }
}
