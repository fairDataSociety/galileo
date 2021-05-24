OSM Example

### How to test map with local FairOS?

1) Follow "How to create and share your own map?" instruction

2) Go to ```/web/``` folder, run ```yarn```, ```yarn start```

3) Sign in with your FairOS credentials on web project

### How to create and share your own map?

1) Start Bee node (only 0.5.2 version works correctly at this moment)

2) Start ```dfs server``` (https://github.com/fairDataSociety/fairOS-dfs)

3) Download GeoJSON files of specific region with script: https://gist.github.com/IgorShadurin/afdc91d2f21cc8154e24da02d1805813 or use other sources to make GeoJSON files

4) Convert .json files to .csv file with script ```/scripts/json-files-to-csv.js```

5) Start ```dfs-cli```. Create new ```user```, ```pod```, ```kv```. Preferred name for pod ```[country]_[author]_map```, preferred name for kv ```map```

6) Upload .csv to creates key-value storage ```kv loadcsv [[your_kv]] /Users/[[username]]/Downloads/map_sw.csv``` (~30-50 minutes for 500mb file)
 
7) Run ```pod share [[pod_name]]``` and receive reference like that ```2ce7f6aa5995a476c2ee9febd771b832dcc2f9e679ec5d737e81603e7728df4f515b1bd4eed08001a5f0be3b031d184509e92f2af7d34571faf4208fadf3ad58```

8) Share you reference with other users!

### Other

#### Tile files example:

Switzerland: https://testeron.pro/osm/tiles_sw.zip

Czech Republic: https://testeron.pro/osm/tiles_cz.zip

#### Csv tiles example: 
Switzerland: https://testeron.pro/osm/map_sw.csv.zip

Czech Republic: https://testeron.pro/osm/map_cz.csv.zip

Download tiles: https://gist.github.com/IgorShadurin/afdc91d2f21cc8154e24da02d1805813

Make tiles: https://github.com/tilezen/vector-datasource/wiki/Mapzen-Vector-Tile-Service
