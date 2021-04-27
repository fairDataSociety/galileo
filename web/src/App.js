import {MapContainer, TileLayer, Marker, Popup, useMap} from 'react-leaflet';
import './App.css';
import {useEffect, useState} from "react";
import 'tangram/dist/tangram.min';

function App() {
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (!map) {
            return;
        }

        const tangramLayer = window.Tangram.leafletLayer({
            scene: 'scene.yaml',
            attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
        });
        tangramLayer.addTo(map);
    }, [map]);

    return (
        <div className="App">
            <h1>FairOS OSM</h1>
            <MapContainer
                whenCreated={setMap}
                center={[53.902284, 27.561831]}
                zoom={13}
                scrollWheelZoom={false}>
            </MapContainer>
        </div>
    );
}

export default App;
