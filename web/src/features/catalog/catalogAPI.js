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

    await api.podOpen(registryPodName, password);
    await api.kvOpen(registryPodName, REGISTRY_KV_NAME);
    let dataFromRegistry = (await api.kvEntryGet(registryPodName, REGISTRY_KV_NAME, REGISTRY_KV_KEY_NAME)).data;
    dataFromRegistry = getKvValue(dataFromRegistry);

    const data = {
        data: [
            // {
            //     id: 1,
            //     title: "Switzerland [test]",
            //     pod: "map_switzerland_sdancer",
            //     kv: "map",
            //     coordinates: [46.947978, 7.440386],
            //     reference: "eebc7bf689f76c9889fc1fd3f6b1c448168b121493359871c13624a2459ab583775dee8b7665eb3ee90ebabbad21026622bc5334870809738610c86beb1c5532"
            // },
            // {
            //     id: 2,
            //     title: "Czech Republic [test]",
            //     pod: "map_czech_test",
            //     kv: "map",
            //     coordinates: [50.080310, 14.428974],
            //     reference: "e6fd12bd7aafe87cb6570050ed6103727c7909818922cf8dbb49c4d5ac2a3f4dcc8e86a860bf1a00e8e6e9a2e1383a2fc8ae5a8e441184a2ebf194dbdc0d1f72"
            // },
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
