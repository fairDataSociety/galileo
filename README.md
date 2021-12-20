### Run Galileo from scratch (manual & Docker), "How to create maps registry?"

https://github.com/fairDataSociety/galileo/blob/master/instructions/Installation.md

### How to create and share your own map?

1) Start supported version (by FairOS-dfs) of Bee node

2) Start dfs server https://github.com/fairDataSociety/fairOS-dfs

3) Download GeoJSON files of specific region with
   script: https://gist.github.com/IgorShadurin/afdc91d2f21cc8154e24da02d1805813. Find `YOUR_ACCESS_TOKEN` and replace with your key from https://developers.nextzen.org/keys.
   Start downloading process ```python3 osm_tiles_downloader.py 46.06902628310932 14.507817723324576```. Two latest params are coordinates of a region you want to download. 

4) Copy `/scripts/example.env` to `/scripts/.env`
5) Define params:
    1) `FAIROS_URL` - FairOS API url, for example `http://localhost:9090/v1/`
       or `https://fairos-mainnet.fairdatasociety.org/v1/` for out FairOS mainnet instance.
    2) `FAIROS_USERNAME` - FairOS username. If users doesn't exist - it will be created
    3) `FAIROS_PASSWORD` - FairOS password for user
    4) `FAIROS_POD` - pod name. Exists or not. If you want to share the map, then create as uniq name as possible.
    5) `FAIROS_MAP_KV` - key-value name where will be stored map data
    6) `MAP_PATH` - full path to folder with tile files which downloaded above

Install nodejs https://github.com/nodesource/distributions/blob/master/README.md

6) Go to `scripts` folder `cd scripts`, run `npm i` or `yarn`
7) Run upload script `node upload-map-kv.js`. Sometimes you need to pause a process to continue later. To continue
   uploading you can use the command `node upload-map-kv.js retry 78` where 78 is number of position where you want to
   proceed. Stock up on time. Uploading ~ 700 megabytes will take about 7 hours.
   ![Adding keys animation](./content/adding_keys.gif)
8) Wait while script will upload all data and return Map reference. Share you map reference with community.


### Other

#### Tile files examples

Switzerland: https://old.testeron.pro/osm/tiles_sw.zip

Czech Republic: https://old.testeron.pro/osm/tiles_cz.zip

#### Links

Download tiles script: https://gist.github.com/IgorShadurin/afdc91d2f21cc8154e24da02d1805813

Make tiles info: https://github.com/tilezen/vector-datasource/wiki/Mapzen-Vector-Tile-Service
