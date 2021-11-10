import {getFairOSInstance} from "./SharedData";

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

export async function getMapsIndex(password) {
    const fairos = getFairOSInstance();
    let index = {
        pods: [],
        // urlNotFound: 'https://sometileurl.com'
    };
    const pods = (await fairos.podLs()).data;
    for (let pod of [...pods.shared_pod_name, ...pods.pod_name]) {
        const mapIndex = await getPodIndex(pod, password);
        if (mapIndex) {
            index.pods.push(mapIndex);
        }
    }

    // await this.kvLoadCsv('maps', 'sw', localStorage.getItem('osm_sw'));
    // await this.kvLoadCsv('czech_shadurin_map', 'map', localStorage.getItem('osm_cz'));

    return index;
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
                if (mapIndex.code !== 500 && mapIndex.values) {
                    mapIndex = atob(mapIndex.values)

                    if (mapIndex.indexOf('map_index,') === -1) {
                        continue;
                    }

                    mapIndex = prepareJson(mapIndex);

                    mapIndex = JSON.parse(mapIndex);
                    result = {
                        pod,
                        kv: kv.table_name,
                        index: mapIndex
                    };
                }
            } catch (e) {

            }
        }
    }

    return result;
}
