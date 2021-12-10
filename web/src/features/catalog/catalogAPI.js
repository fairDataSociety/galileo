import {findPodIndex, getCustomMaps, getOsmIndex} from "../../service/LocalData";
import {REGISTRY_KV_KEY_NAME, REGISTRY_KV_NAME} from "../../service/SharedData";
import {getKvValue} from "../../service/Utils";

export async function fetchCatalogList(api, registryPodName, password) {
    let customMaps = getCustomMaps();
    const osmIndex = getOsmIndex();

    customMaps = customMaps.map(item => {
        item.isCustom = true;
        return item;
    });

    let dataFromRegistry = [];
    if (registryPodName && password) {
        try {
            await api.podOpen(registryPodName, password);
        } catch (e) {

        }

        await api.kvOpen(registryPodName, REGISTRY_KV_NAME);
        dataFromRegistry = (await api.kvEntryGet(registryPodName, REGISTRY_KV_NAME, REGISTRY_KV_KEY_NAME)).data;
        dataFromRegistry = getKvValue(dataFromRegistry);
    }

    const data = {
        data: [
            ...dataFromRegistry,
            ...customMaps
        ]
    };

    data.data.map(item => {
        item.checked = !!findPodIndex(item.pod, osmIndex);
        return item;
    });

    return data;


}
