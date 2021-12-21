import {getFairOSInstance, getWebCacheInstance} from "./SharedData";

export async function openAll(password) {
    const fairos = getFairOSInstance();
    const pods = (await fairos.podLs()).data;
    for (let pod of [...pods.shared_pod_name, ...pods.pod_name]) {
        try {
            await fairos.podOpen(pod, password);
        } catch (e) {

        }

        let kvs;
        try {
            kvs = (await fairos.kvLs(pod)).data;
        } catch (e) {

        }

        if (kvs?.Tables) {
            for (let kv of kvs.Tables) {
                try {
                    await fairos.kvOpen(pod, kv.table_name);
                    // await this.kvCount(pod, kv.table_name);
                } catch (e) {

                }
            }
        }
    }
}

export async function getMapsIndex(password, isPublic) {
    let index = {
        pods: [],
        // urlNotFound: 'https://sometileurl.com'
    };

    let pods = [];
    if (isPublic) {
        const webCache = getWebCacheInstance();
        pods = await webCache.getPods();
        console.log(pods)
    } else {
        const fairos = getFairOSInstance();
        pods = (await fairos.podLs()).data;
    }

    for (let pod of [...pods.shared_pod_name, ...pods.pod_name]) {
        let mapIndex;
        if (isPublic) {
            mapIndex = await getPodIndexWebCache(pod);
        } else {
            mapIndex = await getPodIndex(pod, password);
        }

        if (mapIndex) {
            index.pods.push(mapIndex);
        }
    }

    // await this.kvLoadCsv('maps', 'sw', localStorage.getItem('osm_sw'));
    // await this.kvLoadCsv('czech_shadurin_map', 'map', localStorage.getItem('osm_cz'));

    return index;
}

export async function getPodIndexWebCache(pod, tableName = 'map') {
    const webCache = getWebCacheInstance();
    const index = await webCache.getPodIndex(pod, tableName);
    return {
        pod,
        kv: tableName,
        index
    };
}

export async function getPodIndex(pod, password) {
    const fairos = getFairOSInstance();

    function prepareJson(mapIndex) {
        mapIndex = mapIndex.replace('map_index,', '');
        mapIndex = mapIndex.replaceAll('""', '"');
        mapIndex = mapIndex.slice(1, -1);

        return mapIndex;
    }

    let result = null;
    try {
        await fairos.podOpen(pod, password);
    } catch (e) {

    }

    const kvs = (await fairos.kvLs(pod)).data;
    if (kvs.Tables) {
        for (let kv of kvs.Tables) {
            await fairos.kvOpen(pod, kv.table_name);
            try {
                let mapIndex = (await fairos.kvEntryGet(pod, kv.table_name, 'map_index')).data;
                if (!mapIndex.values) {
                    continue;
                }

                mapIndex = atob(mapIndex.values);
                // todo add some info to map_index to identify it. If I insert data with kv, but not via csv, then I
                // can't identify index. Just allow everything at this time
                // console.log('mapIndex',mapIndex);
                if (mapIndex.indexOf('map_index,') === -1) {
                    // continue;
                    // clear json if it was uploaded via csv
                } else {
                    mapIndex = prepareJson(mapIndex);
                }

                try {
                    // console.log('before parse..');
                    // console.log(mapIndex);
                    mapIndex = JSON.parse(mapIndex);
                    // console.log('parsed index', mapIndex)
                    result = {
                        pod,
                        kv: kv.table_name,
                        index: mapIndex
                    };
                } catch (e) {
                    console.log(e);
                }
                break;
            } catch (e) {

            }
        }
    }

    return result;
}
