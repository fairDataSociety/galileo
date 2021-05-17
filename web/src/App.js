import {MapContainer} from 'react-leaflet';
import './App.css';
import {useEffect, useMemo, useState} from "react";
import FairOS from "./service/FairOS";
import Login from "./Login";
import {useDispatch, useSelector} from "react-redux";
import {logout, selectUser, setUser,} from './features/user/userSlice';
import Catalog from "./features/catalog/Catalog";
import Registration from "./features/registration/Registration";
import {Route, Switch, useLocation, Redirect} from "react-router-dom";
import About from "./About";
import Home from "./Home";
import Footer from "./Footer";
import Header from "./Header";

export default function App() {
    const api = useMemo(() => new FairOS(), []);
    const dispatch = useDispatch();
    const location = useLocation();
    const path = location.pathname;
    const displayMap = useMemo(
        () => (
            <MapContainer
                whenCreated={async map => {
                    // todo get current pod/kv, coords
                    await api.podOpen('maps','osm');
                    await api.kvOpen('sw');
                    window._fair_pod = 'maps';
                    window._fair_kv = 'sw';
                    const tangramLayer = window.Tangram.leafletLayer({
                        scene: 'scene.yaml',
                        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
                    });

                    tangramLayer.addTo(map);
                }}
                center={[46.947978, 7.440386]}
                zoom={15}
                scrollWheelZoom={false}>
            </MapContainer>
        ),
        [],
    );

    // async function fullLogin(username, password, pod, kv) {
    //     setUserStatusText('');
    //     setUserStatus(STATUS_CHECKING);
    //     let errorItem = null;
    //     try {
    //         const loginData = await api.login(username, password);
    //         const podData = await api.podOpen(pod, password);
    //         const kvData = await api.kvOpen(kv);
    //
    //         errorItem = [
    //             {item: loginData, text: 'Incorrect login or password'},
    //             {item: podData, text: 'Can\'t open pod'},
    //             {item: kvData, text: 'Can\'t open kv'}
    //         ].find(data => data.item.code !== 200);
    //
    //         if (errorItem) {
    //             setUserStatus(STATUS_NOT_AUTH);
    //             setUserStatusText(errorItem.text);
    //         } else {
    //             window._fair_kv = kv;
    //             window._fair_pod = pod;
    //             dispatch(setUser({username, password, pod, kv, isLoggedIn: true}));
    //             setUserStatus(STATUS_AUTH_SUCCESS);
    //         }
    //     } catch (e) {
    //         setUserStatus(STATUS_ERROR);
    //         setUserStatusText(`${e.message}. Please, check your connection and services availability.`);
    //     }
    //
    //     return !errorItem;
    // }

    // function resetCredentials() {
    //     dispatch(setUser({username: '', password: '', pod: '', kv: '', isLoggedIn: false}));
    //     localStorage.setItem('osm_username', '');
    //     localStorage.setItem('osm_password', '');
    //     localStorage.setItem('osm_pod', '');
    //     localStorage.setItem('osm_kv', '');
    // }

    // useEffect(() => {
    //     console.log('useEffect map', map);
    //     if (!map || map._layers.length > 0) {
    //         return;
    //     }
    //
    //     const tangramLayer = window.Tangram.leafletLayer({
    //         scene: 'scene.yaml',
    //         attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
    //     });
    //
    //     tangramLayer.addTo(map);
    // }, [map]);

    function PrivateRoute({children, ...rest}) {
        const user = useSelector(selectUser);

        return (
            <Route
                {...rest}
                render={({location}) =>
                    user.isLoggedIn ? (
                        children
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/login",
                                state: {from: location}
                            }}
                        />
                    )
                }
            />
        );
    }

    return (
        <>
            <Header onLogout={_ => {
                dispatch(logout());
                //resetCredentials();
                // resetForm();
                // setUserStatus(STATUS_NOT_AUTH);
            }
            }/>

            <div className={path === '/' ? 'App' : 'App container py-5'}>
                <Switch>
                    <Route path="/login">
                        <Login/>
                    </Route>


                    <PrivateRoute path="/map">
                        {displayMap}
                    </PrivateRoute>

                    <Route path="/about">
                        <About/>
                    </Route>

                    <Route path="/catalog">
                        <Catalog/>
                    </Route>

                    <Route path="/registration">
                        <Registration afterRegistration={async ({username, password}) => {
                            // todo store data, auth, redirect to catalog
                            // todo or just track status var and execute some code in app?
                            // if (await fullLogin(username, password)) {
                            //
                            // }
                        }
                        }/>
                    </Route>

                    <Route path="/">
                        <Home/>
                    </Route>
                </Switch>
            </div>

            <Footer/>
        </>
    );
}
