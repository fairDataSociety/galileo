import {MapContainer} from 'react-leaflet';
import './App.css';
import {useEffect, useMemo, useState} from "react";
import FairOS from "./service/FairOS";
import img1 from './themes/reveal/img/intro-carousel/space.jpg';
import Login from "./Login";
import {useDispatch, useSelector} from "react-redux";
import {selectUser, setUser,} from './features/user/userSlice';

export default function App() {
    const PAGE_MAIN = 'main';
    const PAGE_ABOUT = 'about';
    const PAGE_MAP = 'map';

    const STATUS_CHECKING = 'checking';
    const STATUS_NOT_AUTH = 'not_auth';
    const STATUS_AUTH_SUCCESS = 'auth_success';
    const STATUS_ERROR = 'error';

    const api = useMemo(() => new FairOS(), []);
    const dispatch = useDispatch();
    const [map, setMap] = useState(null);
    const [page, setPage] = useState(PAGE_MAIN);
    const [userStatus, setUserStatus] = useState(STATUS_CHECKING);
    const [userStatusText, setUserStatusText] = useState('');

    const user = useSelector(selectUser);

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
                dispatch(setUser({username, password, pod, kv, isLoggedIn: true}));
                setUserStatus(STATUS_AUTH_SUCCESS);
            }
        } catch (e) {
            setUserStatus(STATUS_ERROR);
            setUserStatusText(`${e.message}. Please, check your connection and services availability.`);
        }

        return !errorItem;
    }

    function resetCredentials() {
        dispatch(setUser({username: '', password: '', pod: '', kv: '', isLoggedIn: false}));
        localStorage.setItem('osm_username', '');
        localStorage.setItem('osm_password', '');
        localStorage.setItem('osm_pod', '');
        localStorage.setItem('osm_kv', '');
    }

    useEffect(() => {
        async function run() {
            const username = localStorage.getItem('osm_username');
            const password = localStorage.getItem('osm_username');
            const pod = localStorage.getItem('osm_pod');
            const kv = localStorage.getItem('osm_kv');
            dispatch(setUser({username, password, pod, kv, isLoggedIn: false}));
            if (username && password) {
                try {
                    await fullLogin(username, password, pod, kv);
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
                                    // resetForm();
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

                {userStatus === 'not_auth' && <Login fullLogin={fullLogin}/>}

                {userStatus === 'error' && <div>
                    {userStatusText && <div className="alert alert-danger" role="alert">
                        {userStatusText}
                    </div>}

                    <button className="btn btn-primary" onClick={() => {
                        setUserStatus(STATUS_NOT_AUTH);
                        setUserStatusText('');
                        resetCredentials();
                        // resetForm();
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
