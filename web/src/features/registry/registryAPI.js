import {getRegistries} from "../../service/LocalData";

export function fetchRegistriesList() {
    return new Promise((resolve) => {
        let config = window._env.loaded ? window._env : process.env;
        let customRegistries = getRegistries();
            customRegistries = customRegistries.map(item => {
                item.isCustom = true;

                return item;
            });

            setTimeout(() => {
                const data = {
                    data: [
                        {
                            id: config.REACT_APP_DEFAULT_REGISTRY_REFERENCE,
                            title: "FDS Registry",
                            type: 'default',
                            reference: config.REACT_APP_DEFAULT_REGISTRY_REFERENCE
                        },
                        ...customRegistries
                    ]
                };

                resolve(data);
            }, 0)
        }
    );
}
