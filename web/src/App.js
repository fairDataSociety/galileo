import {MapContainer} from 'react-leaflet';
import './App.css';
import {useEffect, useMemo, useState} from "react";
import FairOS from "./service/FairOS";
import img1 from './themes/reveal/img/intro-carousel/space.jpg';

export default function App() {
    const PAGE_MAIN = 'main';
    const PAGE_ABOUT = 'about';
    const PAGE_MAP = 'map';

    const STATUS_CHECKING = 'checking';
    const STATUS_NOT_AUTH = 'not_auth';
    const STATUS_AUTH_SUCCESS = 'auth_success';
    const STATUS_ERROR = 'error';

    const api = useMemo(() => new FairOS(), []);
    const [map, setMap] = useState(null);
    const [page, setPage] = useState(PAGE_MAIN);
    const [userStatus, setUserStatus] = useState(STATUS_CHECKING);
    const [userStatusText, setUserStatusText] = useState('');
    const [user, setUser] = useState({
        isLoggedIn: false,
        username: '',
        password: '',
        pod: '',
        kv: ''
    });

    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formPod, setFormPod] = useState('');
    const [formKv, setFormKv] = useState('');

    async function fullLogin(username, password, pod, kv) {
        setUserStatusText('');
        setUserStatus(STATUS_CHECKING);
        let errorItem = null;
        try {
            const loginData = await api.login(username, password);
            const podData = await api.podOpen(pod, password);
            const kvData = await api.kvOpen(kv);

            errorItem = [
                {item: loginData, text: 'Incorrect login or password'},
                {item: podData, text: 'Can\'t open pod'},
                {item: kvData, text: 'Can\'t open kv'}
            ].find(data => data.item.code !== 200);

            if (errorItem) {
                setUserStatus(STATUS_NOT_AUTH);
                setUserStatusText(errorItem.text);
            } else {
                window._fair_kv = kv;
                window._fair_pod = pod;
                setUser({username, password, pod, kv, isLoggedIn: true});
                setUserStatus(STATUS_AUTH_SUCCESS);
            }
        } catch (e) {
            setUserStatus(STATUS_ERROR);
            setUserStatusText(`${e.message}. Please, check your connection and services availability.`);
        }

        return !errorItem;
    }

    function isSubmitFormEnabled() {
        return formUsername && formPassword && formPod && formKv;
    }

    function resetCredentials() {
        setUser({username: '', password: '', pod: '', kv: '', isLoggedIn: false});
        localStorage.setItem('osm_username', '');
        localStorage.setItem('osm_password', '');
        localStorage.setItem('osm_pod', '');
        localStorage.setItem('osm_kv', '');
    }

    function resetForm() {
        setFormUsername('');
        setFormPassword('');
        setFormPod('');
        setFormKv('');
    }

    useEffect(() => {
        async function run() {
            const username = localStorage.getItem('osm_username');
            const password = localStorage.getItem('osm_username');
            const pod = localStorage.getItem('osm_pod');
            const kv = localStorage.getItem('osm_kv');
            setUser({username, password, pod, kv, isLoggedIn: false});
            if (username && password) {
                try {
                    await fullLogin(username, password, pod, kv);
                    setUser(user => {
                        return {...user, isLoggedIn: true};
                    });

                } catch (e) {
                    console.log('error', e);
                    setUserStatus(STATUS_ERROR);
                    setUserStatusText(`${e.message}. Can't login with stored credentials. Refresh page or enter new credentials.`);
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

    return (
        <>
            <header id="header">
                <div className="container">
                    <div id="logo" className="float-left" onClick={e => {
                        e.preventDefault();
                        setPage(PAGE_MAIN);
                    }}>
                        <h1><a href="#" className="scrollto">Fair<span>Maps</span></a></h1>
                    </div>

                    <nav id="nav-menu-container">
                        <ul className="nav-menu">
                            <li className={page === PAGE_MAIN ? 'menu-active' : ''}><a href="#" onClick={e => {
                                e.preventDefault();
                                setPage(PAGE_MAIN);
                            }}>Home</a></li>

                            <li className={page === PAGE_ABOUT ? 'menu-active' : ''}><a href="#" onClick={e => {
                                e.preventDefault();
                                setPage(PAGE_ABOUT);
                            }}>About</a></li>

                            <li className=""><a target="_blank"
                                                href="https://github.com/fairDataSociety/osm-example">Docs</a></li>

                            {!user.isLoggedIn &&
                            <li className={page === PAGE_MAP ? 'menu-active' : ''}><a href="#" onClick={e => {
                                e.preventDefault();
                                setPage(PAGE_MAP);
                            }}>Login</a></li>}

                            {user.isLoggedIn &&
                            <li className={page === PAGE_MAP ? 'menu-active' : ''}><a href="#" onClick={e => {
                                e.preventDefault();
                                setPage(PAGE_MAP);
                            }}>Map</a></li>}

                            {user.isLoggedIn && <li className=""><a href="#" onClick={e => {
                                e.preventDefault();
                                if (window.confirm('Really logout?')) {
                                    resetCredentials();
                                    resetForm();
                                    setUserStatus(STATUS_NOT_AUTH);
                                }
                            }}>Logout</a></li>}
                        </ul>
                    </nav>

                </div>
            </header>

            {page === PAGE_MAIN && <div className="App">
                <section id="intro">
                    <div className="intro-content">
                        <h2>You deserve <span>fair</span><br/>maps!</h2>
                        <div>
                            <a href="#" className="btn-get-started scrollto" onClick={e => {
                                e.preventDefault();
                                setPage(PAGE_MAP);
                            }}>Get Started</a>
                        </div>
                    </div>

                    <div id="intro-carousel" className="owl-carousel">
                        <div className="item" style={{
                            backgroundImage: `url('${img1}')`
                        }}/>
                    </div>

                </section>
            </div>}

            {page === PAGE_ABOUT && <div className="App container py-5">
                FairMaps - an open source project that allows you to use, create and modify maps of various
                participants.
            </div>}

            {page === PAGE_MAP && <div className="App container py-5">
                {userStatus === STATUS_CHECKING && <div>
                    Checking user...
                </div>}

                {userStatus === 'not_auth' &&
                <div className="d-flex justify-content-center">
                    <div className="col-sm-9 col-md-6">
                        <h3>Login with local FairOS credentials</h3>
                        <form onSubmit={async e => {
                            e.preventDefault();
                            if (await fullLogin(formUsername, formPassword, formPod, formKv)) {
                                localStorage.setItem('osm_username', formUsername);
                                localStorage.setItem('osm_password', formPassword);
                                localStorage.setItem('osm_pod', formPod);
                                localStorage.setItem('osm_kv', formKv);
                            }
                        }}>
                            <fieldset disabled={userStatus !== STATUS_NOT_AUTH}>
                                {userStatusText && <div className="alert alert-danger" role="alert">
                                    {userStatusText}
                                </div>}
                                <div className="mb-3">
                                    <label htmlFor="exampleInputEmail1" className="form-label">Username</label>
                                    <input type="text" className="form-control"
                                           onChange={e => setFormUsername(e.target.value)}
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
                                    <label htmlFor="exampleInputPassword1" className="form-label">Pod kv (key-value
                                        table)</label>
                                    <input type="text" className="form-control"
                                           onChange={e => setFormKv(e.target.value)}
                                           value={formKv}/>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={!isSubmitFormEnabled()}>
                                    Submit
                                </button>
                            </fieldset>
                        </form>
                    </div>
                </div>}
                {userStatus === 'error' && <div>
                    {userStatusText && <div className="alert alert-danger" role="alert">
                        {userStatusText}
                    </div>}

                    <button className="btn btn-primary" onClick={() => {
                        setUserStatus(STATUS_NOT_AUTH);
                        setUserStatusText('');
                        resetCredentials();
                        resetForm();
                    }
                    }>
                        Enter new credentials
                    </button>
                </div>}
                {userStatus === STATUS_AUTH_SUCCESS && <MapContainer
                    whenCreated={setMap}
                    center={[46.947978, 7.440386]}
                    zoom={15}
                    scrollWheelZoom={false}>
                </MapContainer>}
            </div>}

            <footer id="footer">
                <div className="container">
                    <div className="copyright">
                        From <a href="https://fairdatasociety.org/">Fair Data Society</a> with ❤️<br/>
                        <a href="https://github.com/fairDataSociety/osm-example">Github</a>
                    </div>
                </div>
            </footer>
        </>
    );
}
