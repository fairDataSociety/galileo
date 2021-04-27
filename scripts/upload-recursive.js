const fetch = require('node-fetch');
const globby = require('globby');
const FormData = require('form-data');
const fs = require('fs');

const user = 'osm';
const password = 'osm';
const pod = 'osm';
const url = 'http://localhost:9090/v0/';

function removeFileName(file) {
    return file.substring(0, file.lastIndexOf('/'));
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function run() {
    const findDirectory = '/Users/sdancer/Downloads/tiles/';

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

    let formData = new FormData();
    formData.append('user', user);
    formData.append('password', password);

    const res = await fetch(`${url}user/login`, {
        method: 'POST',
        body: formData
    });
    const cookies = res.headers.get('set-cookie').split(';')[0];
    // console.log(cookies);

    formData = new FormData();
    formData.append('pod', pod);
    formData.append('password', password);
    let text = await (await fetch(`${url}pod/open`, {
        method: 'POST',
        headers: {
            Cookie: cookies
        },
        body: formData
    })).text();
    console.log(text);

    // for (const dir of dirs) {
    //     formData = new FormData();
    //     formData.append('dir', `/${dir}`);
    //     console.log(`Creating /${dir}`);
    //     text = await (await fetch(`${url}dir/mkdir`, {
    //         method: 'POST',
    //         headers: {
    //             Cookie: cookies,
    //         },
    //         body: formData
    //     })).text();
    //     console.log(text);
    //     await sleep(300);
    // }

    let i = 1;
    for (const file of files) {
        console.log(`File ${i}/${files.length} uploading...`);
        console.log(file.short);
        text = await (await fetch(`${url}file/stat?file=/${file.short}`, {
            method: 'GET',
            headers: {
                Cookie: cookies,
            },
            // body: formData
        })).json();

        if (text.code === 500) {
            const stat = fs.statSync(file.full);
            console.log(`File size: ${stat.size}`);
            if (stat.size < 1000) {
                console.log(`!!!! Possible error`);
                continue;
            }

            formData = new FormData();
            formData.append('pod_dir', `/${removeFileName(file.short)}`);
            formData.append('block_size', '1Mb');
            const stream = fs.createReadStream(file.full);
            formData.append('files', stream);
            text = await (await fetch(`${url}file/upload`, {
                method: 'POST',
                headers: {
                    Cookie: cookies,
                },
                body: formData
            })).text();
            console.log(text);
            await sleep(300);
            stream.destroy();
        } else {
            console.log('Exists. Skip.');
        }

        i++;
    }
}

run();
