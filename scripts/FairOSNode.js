const fetch = require('node-fetch');
const {FormData} = require('formdata-node');

module.exports = class FairOS {
    apiUrl;
    cookie = '';

    constructor(apiUrl = 'http://localhost:9090/v1/') {
        // constructor(apiUrl = `${process.env.REACT_APP_FAIROSHOST}/v1/`) {
        this.apiUrl = apiUrl;
    }

    api(method, url, formData = {} | FormData, type = 'json', result = 'default', customHeaders = '') {
        let headers = type === 'json' ? {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cookie': this.cookie
        } : {
            'Cookie': this.cookie
        };
        if (customHeaders) {
            headers = {
                'Cookie': this.cookie,
                // 'Content-Type': 'multipart/form-data'
                ...formData.getHeaders()
            };
            console.log(headers);
        }
        const postData = method === 'POST' ? {
            method: method,
            headers,
            // todo check is work if received formData as object
            body: type === 'json' ? JSON.stringify(formData) : formData,
            credentials: 'include'
        } : {
            method: method,
            headers: {
                'Cookie': this.cookie
            },
            credentials: 'include'
        };

        return fetch(url, postData).then(data => {
            // console.log(data.headers.raw()['set-cookie']);
            let receivedCookie = data.headers.raw()['set-cookie'];
            if (receivedCookie && receivedCookie.length) {
                receivedCookie = receivedCookie[0].split(';');
                if (receivedCookie && receivedCookie.length) {
                    this.cookie = receivedCookie[0];
                }
            }

            return result === 'text' ? data.text() : data.json();
        });
    }

    isUserLoggedIn(username) {
        return this.api('GET', `${this.apiUrl}user/isloggedin?user=${username}`);
    }

    login(username, password) {
        // let formData = new FormData();
        // formData.append('user_name', username);
        // formData.append('password', password);
        const formData = {
            user_name: username,
            password
        };
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
        const formData = {pod_name: pod, password};
        return this.api('POST', `${this.apiUrl}pod/open`, formData);
    }

    podShare(pod, password) {
        const formData = {pod_name: pod, password};
        return this.api('POST', `${this.apiUrl}pod/share`, formData);
    }

    podNew(pod, password) {
        // let formData = new FormData();
        // formData.append('pod_name', pod);
        // formData.append('password', password);
        const formData = {
            pod_name: pod, password
        };
        return this.api('POST', `${this.apiUrl}pod/new`, formData);
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
        // let formData = new FormData();
        // formData.append('table_name', kvName);
        const formData = {table_name: kvName};
        return this.api('POST', `${this.apiUrl}kv/open?pod_name=${podName}`, formData);
    }

    kvNew(podName, kvName) {
        const formData = {table_name: kvName};
        return this.api('POST', `${this.apiUrl}kv/new?pod_name=${podName}`, formData);
    }

    kvPut(podName, kvName, key, value) {
        const formData = {table_name: kvName, key, value};
        return this.api('POST', `${this.apiUrl}kv/entry/put?pod_name=${podName}`, formData,'json','text');
    }

    kvDelete(podName, kvName) {
        const formData = {table_name: kvName};
        return this.api('POST', `${this.apiUrl}kv/delete?pod_name=${podName}`, formData,'json','text');
    }

    fileDownload(file) {
        return this.api('GET', `${this.apiUrl}file/download?file=${file}`, '', 'etc', 'text');
    }

    // fileUpload(content, pod) {
    //     console.log(pod)
    //     console.log(content);
    //     console.log(this.cookie);
    //     const file = new File([content], "info.json");
    //     let formData = new FormData();
    //     // formData.append('files', file, {
    //     //     contentType: 'text/plain',
    //     //     filename: 'info.json',
    //     // });
    //     formData.set("files", file);
    //     const encoder = new Encoder(formData);
    //     const url = `${this.apiUrl}file/upload?pod_name=${pod}&dir_path=/&block_size=64Mb`;
    //     // return this.api('POST', `${this.apiUrl}file/upload?pod_name=${pod}&dir_path=/&block_size=64Mb`, formData, 'etc', 'text', 'custom');
    //     const postData = {
    //         method: 'POST',
    //         headers: {
    //             'Cookie': this.cookie,
    //             ...encoder.headers
    //         },
    //         body: Readable.from(encoder),
    //         credentials: 'include'
    //     }
    //
    //     return fetch(url, postData).then(data => data.text());
    // }

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
