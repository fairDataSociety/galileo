import {getRegistries} from "../../service/LocalData";

export function fetchRegistriesList() {
    return new Promise((resolve) => {
            let customRegistries = getRegistries();
            customRegistries = customRegistries.map(item => {
                item.isCustom = true;

                return item;
            });

            setTimeout(() => {
                const data = {
                    data: [
                        {
                            id: 1,
                            title: "FDS Registry",
                            reference: "____"
                        },
                        ...customRegistries
                    ]
                };

                resolve(data);
            }, 0)
        }
    );
}
