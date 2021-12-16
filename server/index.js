require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8080;

app.options('*', cors())
// app.use(cors());
app.use(express.json());

const mapPath = process.env.MAP_PATH;
// structure
// POD/TABLE/Z/X/Y
// https://fairos.fairdatasociety.org/v1/kv/entry/get?pod_name=map_sw_pod1&table_name=map&key=2_2_1

const allowList = ['http://localhost:3000', 'https://app.galileo.fairdatasociety.org/'];
const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (allowList.indexOf(req.header('Origin')) !== -1) {
        corsOptions = {origin: true, credentials: true} // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = {origin: false} // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
};

app.get('/v1/kv/entry/get', cors(corsOptionsDelegate), async (req, res) => {
    const {pod_name, table_name, key} = req.query;
    const [z, x, y] = key?.split('_');
    if (!(pod_name && table_name && key && z && x && y)) {
        res.status(500)
        res.send({result: 'error', text: `Incorrect params: ${pod_name}, ${table_name}, ${key}`});
        return;
    }

    const path = `${mapPath}${pod_name}/${table_name}/${z}/${x}/${y}.json`;
    if (fs.existsSync(path)) {
        // todo try to get from memory cache
        res.send(fs.readFileSync(path));
    } else {
        res.status(500)
        res.send({result: 'error', text: 'File not found'});
    }
});

app.listen(port, () => console.log(`Started server at http://localhost:${port}`));
