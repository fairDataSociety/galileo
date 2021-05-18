export function fetchCatalogList() {
    return new Promise((resolve) =>
        setTimeout(() => resolve({
            data: [
                {
                    id: 1,
                    title: "Switzerland",
                    pod: "maps",
                    kv: "sw",
                    coordinates: [46.947978, 7.440386],
                    reference: "07bcccde50709ba2b444b9dd20607dcee7f7fd8a8ada9287652217448f3228d3d72f0fdc58ae2e463f1373e92ea6c9ad09903ab408adf0a2f0149b11b178146c"
                },
                {
                    id: 2,
                    title: "Czech Republic",
                    pod: "czech_shadurin_map",
                    kv: "map",
                    coordinates: [50.080310, 14.428974],
                    reference: "3fac0b90f8ff8369f38bc0fd5f6ab3cb9e7acf21275afd779d85f8522dda22509a9daeb74f2048dc25fa95b1ebceb783fbba410ed501e6746e7f9b6002df81c5"
                }
            ]
        }), 0)
    );
}
