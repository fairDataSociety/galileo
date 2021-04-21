import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import './App.css';

function App() {
    return (
        <div className="App">
            <h1>FairOS OSM</h1>
            <MapContainer center={[53.908436, 30.336147]} zoom={13} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            </MapContainer>
        </div>
    );
}

export default App;
