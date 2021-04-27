import {MapContainer} from 'react-leaflet';
import './App.css';
import {useEffect, useMemo, useState} from "react";
import FairOS from "./service/FairOS";

export default function App() {
    const STATUS_CHECKING = 'checking';
    const STATUS_NOT_AUTH = 'not_auth';
    const STATUS_AUTH_SUCCESS = 'auth_success';
    const STATUS_ERROR = 'error';

    const api = useMemo(() => new FairOS(), []);
    const [map, setMap] = useState(null);
    const [userStatus, setUserStatus] = useState(STATUS_CHECKING);
    const [user, setUser] = useState({
        username: '',
        password: ''
    });
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');

    useEffect(() => {
        async function run() {
            const username = localStorage.getItem('osm_username');
            const password = localStorage.getItem('osm_username');
            setUser({username, password});
            if (username) {
                try {
                    const userData = await api.isUserLoggedIn(username);
                    const pod = await api.podOpen('osm', password);
                    setUserStatus(userData.loggedin ? STATUS_AUTH_SUCCESS : STATUS_NOT_AUTH);
                } catch (e) {
                    setUserStatus(STATUS_ERROR);
                }
            } else {
                setUserStatus(STATUS_NOT_AUTH);
            }
        }

        run();
    }, []);

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
            {userStatus === 'checking' && <div>
                Checking user...
            </div>}
            {userStatus === 'not_auth' && <div>
                <form onSubmit={async e => {
                    e.preventDefault();
                    setUserStatus(STATUS_CHECKING);
                    const data = await api.login(formUsername, formPassword);
                    if (data.code === 200) {
                        await api.podOpen('osm', formPassword);
                        localStorage.setItem('osm_username', formUsername);
                        localStorage.setItem('osm_password', formPassword);
                        setUser({username: formUsername, password: formPassword});
                        setUserStatus(STATUS_AUTH_SUCCESS);
                    }
                }} disabled={userStatus !== STATUS_NOT_AUTH}>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Username</label>
                        <input type="text" className="form-control" onChange={e => setFormUsername(e.target.value)}
                               value={formUsername}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                        <input type="password" className="form-control" onChange={e => setFormPassword(e.target.value)}
                               value={formPassword}/>
                    </div>

                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>}
            {userStatus === 'error' && <div>
                Error(
            </div>}
            {userStatus === 'auth_success' && <MapContainer
                whenCreated={setMap}
                center={[53.902284, 27.561831]}
                zoom={13}
                scrollWheelZoom={false}>
            </MapContainer>}
        </div>
    );
};
