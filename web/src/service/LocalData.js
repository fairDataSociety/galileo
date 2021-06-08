export function getOsmIndex() {
    const index = localStorage.getItem('osm_index');
    let parsed = {};
    if (index) {
        parsed = JSON.parse(index);
        // parsed.urlNotFound = 'https://sometile.com';
    }

    return parsed;
}

export function saveOsmIndex(index) {
    localStorage.setItem('osm_index', JSON.stringify(index));
}

export function clearOsmIndex() {
    localStorage.setItem('osm_index', '');
}

export function removePodFromOsmIndex(podName) {
    let index = getOsmIndex();
    index.pods = (index.pods && Array.isArray(index.pods)) ? index.pods.filter(item => item.pod !== podName) : index.pods;
    saveOsmIndex(index);
}

export function addPodToIndex(podObject) {
    let index = getOsmIndex();
    if (index.pods && Array.isArray(index.pods)) {
        const isExists = index.pods.find(item => item.pod === podObject.pod);
        if (!isExists) {
            index.pods.push(podObject);
        }
    }

    saveOsmIndex(index);
}

export function findPodIndex(podName, index) {
    return index.pods?.find(item => item.pod === podName);
}

export function setWindowIndex(index) {
    window._fair_data = index;
}
