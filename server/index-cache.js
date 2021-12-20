import fs from "fs";
import {createMapIndex, makeIndexJson} from "./utils.js";
import {config} from "dotenv";

config();

const mapPath = process.env.MAP_PATH;

async function run() {
    const dirs = fs.readdirSync(mapPath).filter(item => !item.startsWith('.'));
    console.log('Found dirs ' + dirs.length);
    console.log(dirs);
    for (const dir of dirs) {
        const fullDir = mapPath + dir + '/map/';
        const jsonPath = fullDir + 'map_index';
        console.log(fullDir);

        const index = createMapIndex(fullDir);
        const mapJson = makeIndexJson(index);

        fs.writeFileSync(jsonPath, JSON.stringify(mapJson));
    }
}

run().then();
