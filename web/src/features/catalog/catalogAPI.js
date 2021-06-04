export function fetchCatalogList() {
    return new Promise((resolve) => {
            let customMaps = localStorage.getItem('osm_custom_maps');
            if (customMaps) {
                customMaps = JSON.parse(customMaps);
            } else {
                customMaps = [];
            }

            customMaps = customMaps.map(item => {
                item.isCustom = true;
                return item;
            });

            setTimeout(() => resolve({
                data: [
                    {
                        id: 1,
                        title: "Switzerland [test]",
                        pod: "map_switzerland_sdncer",
                        kv: "map",
                        coordinates: [46.947978, 7.440386],
                        reference: "eebc7bf689f76c9889fc1fd3f6b1c448168b121493359871c13624a2459ab583775dee8b7665eb3ee90ebabbad21026622bc5334870809738610c86beb1c5532"
                    },
                    {
                        id: 2,
                        title: "Czech Republic [test]",
                        pod: "map_czech_test",
                        kv: "map",
                        coordinates: [50.080310, 14.428974],
                        reference: "e6fd12bd7aafe87cb6570050ed6103727c7909818922cf8dbb49c4d5ac2a3f4dcc8e86a860bf1a00e8e6e9a2e1383a2fc8ae5a8e441184a2ebf194dbdc0d1f72"
                    },
                    ...customMaps
                ]
            }), 0)
        }
    );
}
