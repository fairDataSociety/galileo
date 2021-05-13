export function fetchCatalogList() {
    return new Promise((resolve) =>
        setTimeout(() => resolve({
            data: [
                {
                    id: 1,
                    title: "Switzerland",
                },
                {
                    id: 2,
                    title: "Belarus"
                }
            ]
        }), 500)
    );
}
