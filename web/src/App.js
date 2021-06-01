import {MapContainer} from 'react-leaflet';
import './App.css';
import {useEffect, useMemo} from "react";
import Login from "./Login";
import {useDispatch, useSelector} from "react-redux";
import {logout, resetStatus, selectUser, tryLogin,} from './features/user/userSlice';
import Catalog from "./features/catalog/Catalog";
import Registration from "./features/registration/Registration";
import {Link, Redirect, Route, Switch, useLocation} from "react-router-dom";
import About from "./About";
import Home from "./Home";
import Footer from "./Footer";
import Header from "./Header";
import {selectCatalog} from "./features/catalog/catalogSlice";

export default function App() {
    const catalog = useSelector(selectCatalog);
    const dispatch = useDispatch();
    const location = useLocation();
    const path = location.pathname;
    const displayMap = useMemo(
        () => (
            catalog.activeItem ? <MapContainer
                whenCreated={async map => {
                    const tangramLayer = window.Tangram.leafletLayer({
                        scene: 'scene.yaml',
                        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
                    });

                    tangramLayer.addTo(map);
                }}
                center={catalog.activeItem.coordinates}
                zoom={15}
                scrollWheelZoom={false}>
            </MapContainer> : <p>Please, load map from <Link to="/catalog">catalog</Link></p>
        ),
        [catalog.activeItem],
    );

    useEffect(_ => {
        dispatch(resetStatus());
        dispatch(tryLogin());
    }, []);

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
            }
            }/>

            <div className={path === '/' ? 'App' : 'App container py-5'}>
                <Switch>
                    <Route path="/login">
                        <Login/>
                    </Route>

                    <PrivateRoute path="/map">
                        {catalog.activeItem ?
                            <h3>Loaded map: {catalog.activeItem.title}. <Link to="/catalog">Choose another</Link>
                            </h3> : ''}
                        {displayMap}
                    </PrivateRoute>

                    <Route path="/about">
                        <About/>
                    </Route>

                    <Route path="/catalog">
                        <Catalog/>
                    </Route>

                    <Route path="/registration">
                        <Registration/>
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
