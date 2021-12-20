# Installation from scratch

## Create registry

The Registry is a directory of maps that is managed by a specific person or organization. Different regions can be
stored in this directory. To pass the registry to the end user, you need to send him a reference hash. The user can use
the catalogs in the Registries tab.

### How to create a registry?

`cd scripts/registry`

`yarn`

`cp example.config.json .config.json`, define FairOS username and password

`node create.js`

Then add map by passing pass map title, pod, kv (inside pod), coordinates and reference

`node add-map.js "My map title" YOUR_POD_NAME KV_NAME "53.0111,30.111" POD_REFERENCE`

## Manual running

`cd web`

`yarn`

`cd public`

`cp example.env.js env.js`

fill registry hash and FairOS api url inside .env file

`cp example.scene.yaml scene.yaml`

fill sources.tilezen.url with your FairOS API url template,
example `https://fairos.fairdatasociety.org/v1/kv/entry/get?pod_name={fair_pod}&table_name={fair_kv}&key={z}_{x}_{y}`

`cd ..`

`yarn start` to start with built-in server or

`yarn build` to build production version

## Run docker build

`docker run -p 3000:80 -e REACT_APP_DEFAULT_REGISTRY_REFERENCE='YOUR_REFERENCE_HERE' -e REACT_APP_FAIROSHOST='YOUR_HOST_HERE' -e MAP_URL_TEMPLATE='YOUR_MAP_URL' fairdatasociety/galileo`

example

`docker run -p 3000:80 -e REACT_APP_DEFAULT_REGISTRY_REFERENCE='f1dd430e2d645f38d4db128d418b60c9bd2352cbce493fce8b077e1a5fb9eac0389c61a9e427167b1d4c108a7aef6d83107d1f20f48c8b7c13bfdc6f638e0142' -e REACT_APP_FAIROSHOST='https://fairos.fairdatasociety.org/v1/' -e MAP_URL_TEMPLATE='https://fairos.fairdatasociety.org/v1/kv/entry/get?pod_name={fair_pod}\&table_name={fair_kv}\&key={z}_{x}_{y}' fairdatasociety/galileo`

## How to speedup maps server and prevent tiles loosing - In development

One way to speed up the loading of map tiles is to cache on a staging server, which is accessible from at least 3
different domains. You can find an example of such a layer in the `./server` folder.
