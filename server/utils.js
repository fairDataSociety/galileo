import {globbySync} from "globby";

export function makeIndexJson(files) {
    let index = {};
    files.forEach(item => {
        let [z, x, y] = item.short.replace('.json', '').split('/');
        if (!index[z]) {
            index[z] = {};
        }

        if (!index[z][x]) {
            index[z][x] = {};
        }

        if (!index[z][x][y]) {
            index[z][x][y] = 1;
        }
    });

    return index;
}

export function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

export function createMapIndex(path) {
    return globbySync([`${path}**/*.json`])
        .map(item => {
            const short = item.replace(path, '');
            return {
                key: replaceAll(short.replace('.json', ''), '/', '_'),
                short,
                full: item
            };
        })
        .filter(item => item.key.split('_').length === 3);
}
