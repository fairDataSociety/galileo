const globby = require('globby');
const fs = require('fs');

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function removeFileName(file) {
    return file.substring(0, file.lastIndexOf('/'));
}

async function run() {
    const findDirectory = '/Users/sdancer/Downloads/tiles_sw/';

    const files = globby.sync([`${findDirectory}**/*.json`])
        .map(item => {
            return {
                short: item.replace(findDirectory, ''),
                full: item
            };
        });
    const dirs = [];
    files.forEach(fileObj => {
        const file = fileObj.short;
        const item = removeFileName(file);
        if (dirs.indexOf(item) === -1) {
            dirs.push(item);
        }
    });

    const outFile = '/Users/sdancer/Downloads/map_sw.csv';
    fs.appendFileSync(outFile, `Key,Value\r\n`)
    for (const [index, file] of files.entries()) {
        console.log(`File ${index + 1}/${files.length} adding to csv...`);
        const key = replaceAll(file.short.replace('.json', ''), '/', '_');
        let value = replaceAll(fs.readFileSync(file.full, {encoding: 'utf8', flag: 'r'}), '"', '""');
        fs.appendFileSync(outFile, `${key},"${value}"\r\n`);
    }
}

run();
