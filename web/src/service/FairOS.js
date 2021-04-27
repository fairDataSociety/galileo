export default class FairOS {
    apiUrl;

    constructor(apiUrl = 'http://localhost:9090/v0/') {
        this.apiUrl = apiUrl;
    }

    api(method, url, formData = {}) {
        const postData = method === 'POST' ? {
            method: method,
            body: formData,
            credentials: 'include'
        } : {
            method: method,
            credentials: 'include'
        };

        return fetch(url, postData)
            .then(data => data.json());
    }

    isUserLoggedIn(username) {
        return this.api('GET', `${this.apiUrl}user/isloggedin?user=${username}`);
    }

    login(username, password) {
        let formData = new FormData();
        formData.append('user', username);
        formData.append('password', password);
        return this.api('POST', `${this.apiUrl}user/login`, formData);
    }

    podOpen(pod, password) {
        let formData = new FormData();
        formData.append('pod', pod);
        formData.append('password', password);
        return this.api('POST', `${this.apiUrl}pod/open`, formData);
    }
}
