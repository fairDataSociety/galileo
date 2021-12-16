export default class WebCache {
    url = '';

    constructor(url) {
        this.url = url;
    }

    async getPods() {
        const data= await fetch(`${this.url}/get-pods`);
        return await data.json();
    }

    getPodIndex(pod, tableName) {
        return fetch(`${this.url}/get-pod-index?pod=${pod}&table_name=${tableName}`).then(data => data.json());
    }
}
