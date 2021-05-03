OSM Example

### How to test map with local FairOS?

1) Start Bee node (only 0.5.2 version works correctly at this moment)

2) Start ```dfs server``` (https://github.com/fairDataSociety/fairOS-dfs)

3) Download GeoJSON files of specific region with script: https://gist.github.com/IgorShadurin/afdc91d2f21cc8154e24da02d1805813

4) Convert .json files to .csv with script ```/scripts/json-files-to-csv.js```

5) Start ```dfs-cli```. Create new ```user```, ```pod```, ```kv```. 

6) Upload .csv to creates key-value storage ```kv loadcsv [[your_kv]] /Users/sdancer/Downloads/map_sw.csv```

6) Go to ```/web/``` folder, run ```yarn```, ```yarn start```

7) Paste your coordinates in /src/App.js in line with code ```center={[53.902284, 27.561831]}```

8) Sign in with your credentials on web project


### Utility

https://download.geofabrik.de/europe/belarus.html

Make tiles: https://github.com/tilezen/vector-datasource/wiki/Mapzen-Vector-Tile-Service

Download tiles: https://gist.github.com/tonyrewin/9444410
