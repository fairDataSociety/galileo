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
    const [userStatusText, setUserStatusText] = useState('');
    const [user, setUser] = useState({
        username: '',
        password: '',
        pod: '',
        kv: ''
    });

    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formPod, setFormPod] = useState('');
    const [formKv, setFormKv] = useState('');

    useEffect(() => {
        async function run() {
            const username = localStorage.getItem('osm_username');
            const password = localStorage.getItem('osm_username');
            const pod = localStorage.getItem('osm_pod');
            const kv = localStorage.getItem('osm_kv');
            setUser({username, password, pod, kv});
            if (username && password) {
                try {
                    // const userData = await api.isUserLoggedIn(username);
                    // if (!userData.loggedin) {
                    //     await api.login(username, password);
                    //     // todo validate answer
                    //
                    //     //     setUserStatus(STATUS_NOT_AUTH);
                    //     //     return;
                    //     //
                    //     //
                    //     // setUserStatus(STATUS_NOT_AUTH);
                    //     // return;
                    // }

                    await api.login(username, password);
                    const podData = await api.podOpen(pod, password);
                    const kvData = await api.kvOpen(kv);
                    // todo check pod & kv answers
                    window._fair_kv = kv;
                    window._fair_pod = pod;
                    setUserStatus(STATUS_AUTH_SUCCESS);
                } catch (e) {
                    console.log('error', e);
                    setUserStatus(STATUS_ERROR);
                }
            } else {
                setUserStatus(STATUS_NOT_AUTH);
            }
        }

        run();
    }, []);

    useEffect(() => {
        if (!map || map._layers.length > 0) {
            return;
        }

        const tangramLayer = window.Tangram.leafletLayer({
            scene: 'scene.yaml',
            attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
        });

        tangramLayer.addTo(map);
    }, [map]);

    function isSubmitFormEnabled() {
        return formUsername && formPassword && formPod && formKv;
    }

    return (
        <div className="App container py-5">
            <h2 className="pb-2 border-bottom">Decentralized map service</h2>
            {userStatus === STATUS_CHECKING && <div>
                Checking user...
            </div>}
            {userStatus === 'not_auth' && <div>
                <form onSubmit={async e => {
                    e.preventDefault();
                    setUserStatusText('');
                    setUserStatus(STATUS_CHECKING);
                    const loginData = await api.login(formUsername, formPassword);
                    const podData = await api.podOpen(formPod, formPassword);
                    const kvData = await api.kvOpen(formKv);

                    const errorItem = [
                        {item: loginData, text: 'Incorrect login or password'},
                        {item: podData, text: 'Can\'t open pod'},
                        {item: kvData, text: 'Can\'t open kv'}
                    ].find(data => data.item.code !== 200);

                    if (errorItem) {
                        setUserStatus(STATUS_NOT_AUTH);
                        setUserStatusText(errorItem.text);
                    } else {
                        localStorage.setItem('osm_username', formUsername);
                        localStorage.setItem('osm_password', formPassword);
                        localStorage.setItem('osm_pod', formPod);
                        localStorage.setItem('osm_kv', formKv);
                        window._fair_kv = formKv;
                        window._fair_pod = formPod;
                        setUser({
                            username: formUsername,
                            password: formPassword,
                            pod: formPod,
                            kv: formKv,
                        });
                        setUserStatus(STATUS_AUTH_SUCCESS);
                    }
                }}>
                    <fieldset disabled={userStatus !== STATUS_NOT_AUTH}>
                        {userStatusText && <div className="alert alert-danger" role="alert">
                            {userStatusText}
                        </div>}
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">Username</label>
                            <input type="text" className="form-control" onChange={e => setFormUsername(e.target.value)}
                                   value={formUsername}/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                            <input type="password" className="form-control"
                                   onChange={e => setFormPassword(e.target.value)}
                                   value={formPassword}/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Pod name</label>
                            <input type="text" className="form-control"
                                   onChange={e => setFormPod(e.target.value)}
                                   value={formPod}/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Pod kv</label>
                            <input type="text" className="form-control"
                                   onChange={e => setFormKv(e.target.value)}
                                   value={formKv}/>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={!isSubmitFormEnabled()}>
                            Submit
                        </button>
                    </fieldset>
                </form>
            </div>}
            {userStatus === 'error' && <div>
                Error(
            </div>}
            {userStatus === STATUS_AUTH_SUCCESS && <MapContainer
                whenCreated={setMap}
                center={[46.948919, 7.440979]}
                zoom={13}
                scrollWheelZoom={false}>
            </MapContainer>}
        </div>
    );
};
