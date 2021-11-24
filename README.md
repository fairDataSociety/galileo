### Configure Galileo from scratch (manual & Docker)

https://github.com/fairDataSociety/galileo/blob/master/instructions/Installation.md

### How to test map with local FairOS?

1) Follow "How to create and share your own map?" instruction

2) Go to ```/web/``` folder, copy ```.example.env``` => ```.env```, ```public/example.scene.yaml``` => ```public/scene.yaml```, run ```yarn```, ```yarn start```

3) Sign in with your FairOS credentials on web project

### How to create and share your own map?

1) Start Bee node (only 0.6.2 version works correctly at this moment)

2) Start ```dfs server``` (https://github.com/fairDataSociety/fairOS-dfs, 0.6.2)

3) Download GeoJSON files of specific region with script: https://gist.github.com/IgorShadurin/afdc91d2f21cc8154e24da02d1805813 or use other sources to make GeoJSON files: ```osm_tiles_downloader.py 46.06902628310932 14.507817723324576```

4) Copy `/scripts/example.env` to `/scripts/.env`
5) Define params:
   1) `FAIROS_URL` - FairOS API url, for example `http://localhost:9090/v1/`
   2) `FAIROS_USERNAME` - FairOS username. Exists or not
   3) `FAIROS_PASSWORD` - FairOS password for user
   4) `FAIROS_POD` - pod name. Exists or not
   5) `FAIROS_MAP_KV` - key-value name where will be stored map data
   6) `MAP_PATH` - full path to folder with files which downloaded above

6) Go to scripts folder `cd scripts` and run upload script `node upload-map.js`
7) Wait while script will upload all data and return Map reference. Share you map reference with Galileo users

### Other

#### Tile files examples

Switzerland: https://old.testeron.pro/osm/tiles_sw.zip

Czech Republic: https://old.testeron.pro/osm/tiles_cz.zip

#### Links

Download tiles script: https://gist.github.com/IgorShadurin/afdc91d2f21cc8154e24da02d1805813

Make tiles info: https://github.com/tilezen/vector-datasource/wiki/Mapzen-Vector-Tile-Service
