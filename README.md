OSM Example

### How to test map with local FairOS?

1) Start Bee node

2) Start ```dfs server``` (https://github.com/fairDataSociety/fairOS-dfs)

3) Download GeoJSON files of specific region with script: https://gist.github.com/IgorShadurin/afdc91d2f21cc8154e24da02d1805813

4) Upload them to new pod with /scripts/upload-recursive.js. I use osm/osm/osm user/password/pod credentials in examples.

5) Go to /web/ folder, run ```yarn```, ```yarn start```

6) Paste your coordinates in /src/App.js in line with code ```center={[53.902284, 27.561831]}```

7) Sign in with your credentials on web project


### Utility

https://download.geofabrik.de/europe/belarus.html

Make tiles: https://github.com/tilezen/vector-datasource/wiki/Mapzen-Vector-Tile-Service

Download tiles: https://gist.github.com/tonyrewin/9444410
