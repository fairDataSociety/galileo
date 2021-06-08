export default class FairOS {
    apiUrl;

    //constructor(apiUrl = 'http://localhost:9090/v1/') {
    constructor(apiUrl = `${process.env.REACT_APP_FAIROSHOST}/v1/`) {
        this.apiUrl = apiUrl;
    }

    api(method, url, formData = {} | FormData, type = 'json') {
        const postData = method === 'POST' ? {
            method: method,
            headers: type === 'json' ? {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            } : {},
            // todo check is work if received formData as object
            body: type === 'json' ? JSON.stringify(Object.fromEntries(formData)) : formData,
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
        formData.append('user_name', username);
        formData.append('password', password);
        return this.api('POST', `${this.apiUrl}user/login`, formData);
    }

    signup(username, password, mnemonic) {
        let formData = new FormData();
        formData.append('user_name', username);
        formData.append('password', password);
        formData.append('mnemonic', mnemonic);
        return this.api('POST', `${this.apiUrl}user/signup`, formData);
    }

    podOpen(pod, password) {
        let formData = new FormData();
        formData.append('pod_name', pod);
        formData.append('password', password);
        return this.api('POST', `${this.apiUrl}pod/open`, formData);
    }

    podReceive(reference) {
        return this.api('GET', `${this.apiUrl}pod/receive?sharing_ref=${reference}`);
    }

    podReceiveInfo(reference) {
        return this.api('GET', `${this.apiUrl}pod/receiveinfo?sharing_ref=${reference}`);
    }

    podLs() {
        return this.api('GET', `${this.apiUrl}pod/ls`);
    }

    kvLs(podName) {
        return this.api('GET', `${this.apiUrl}kv/ls?pod_name=${podName}`);
    }

    kvGet(podName, tableName, key) {
        return this.api('GET', `${this.apiUrl}kv/entry/get?pod_name=${podName}&table_name=${tableName}&key=${key}`);
    }

    kvLoadCsv(podName, tableName, csv) {
        let formData = new FormData();
        formData.append('csv', new Blob([csv], {
            encoding: "UTF-8",
            type: "text/csv;charset=UTF-8"
        }), '1.csv');
        // formData.append('table_name', tableName);
        return this.api('POST', `${this.apiUrl}kv/loadcsv?pod_name=${podName}&table_name=${tableName}`, formData, 'multi');
    }

    kvCount(podName, kvName) {
        let formData = new FormData();
        formData.append('table_name', kvName);
        formData.append('pod_name', podName);
        return this.api('POST', `${this.apiUrl}kv/count?pod_name=${podName}`, formData);
    }

    kvOpen(podName, kvName) {
        let formData = new FormData();
        formData.append('table_name', kvName);
        return this.api('POST', `${this.apiUrl}kv/open?pod_name=${podName}`, formData);
    }

    async openAll(password) {
        const pods = await this.podLs();
        for (let pod of [...pods.shared_pod_name, ...pods.pod_name]) {
            await this.podOpen(pod, password);
            const kvs = await this.kvLs(pod);
            if (kvs.Tables) {
                for (let kv of kvs.Tables) {
                    await this.kvOpen(pod, kv.table_name);
                    // await this.kvCount(pod, kv.table_name);
                }
            }
        }
    }

    async getMapsIndex(password) {
        let index = {
            pods: [],
            // urlNotFound: 'https://sometileurl.com'
        };
        const pods = await this.podLs();
        for (let pod of [...pods.shared_pod_name, ...pods.pod_name]) {
            const mapIndex = await this.getPodIndex(pod, password);
            index.pods.push(mapIndex);
        }

        // await this.kvLoadCsv('maps', 'sw', localStorage.getItem('osm_sw'));
        // await this.kvLoadCsv('czech_shadurin_map', 'map', localStorage.getItem('osm_cz'));

        return index;
    }

    async getPodIndex(pod, password) {
        let result = null;
        await this.podOpen(pod, password);
        const kvs = await this.kvLs(pod);
        if (kvs.Tables) {
            for (let kv of kvs.Tables) {
                await this.kvOpen(pod, kv.table_name);
                let mapIndex = await this.kvGet(pod, kv.table_name, 'map_index');
                if (mapIndex.code !== 500 && mapIndex.values) {
                    mapIndex = atob(mapIndex.values)
                    if (mapIndex.indexOf('map_index,') === -1) {
                        continue;
                    }

                    mapIndex = mapIndex.replace('map_index,', '');
                    mapIndex = mapIndex.replaceAll('""', '"');
                    mapIndex = mapIndex.slice(1, -1);
                    mapIndex = JSON.parse(mapIndex);
                    result = {
                        pod,
                        kv: kv.table_name,
                        index: mapIndex
                    };
                }
            }
        }

        return result;
    }
}
