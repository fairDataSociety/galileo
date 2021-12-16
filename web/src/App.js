import {LayerGroup, MapContainer, Marker, Popup, useMapEvents} from 'react-leaflet';
import './App.css';
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Login from "./Login";
import {useDispatch, useSelector} from "react-redux";
import {
    downloadMarkers,
    logout,
    resetStatus,
    saveMarkers,
    selectUser,
    setIsMarkerActive,
    setMarkers,
    tryLogin,
} from './features/user/userSlice';
import Catalog from "./features/catalog/Catalog";
import Registration from "./features/registration/Registration";
import {Link, Redirect, Route, Switch, useLocation} from "react-router-dom";
import About from "./About";
import Home from "./Home";
import Footer from "./Footer";
import Header from "./Header";
import {selectCatalog} from "./features/catalog/catalogSlice";
import Registry from "./features/registry/Registry";
import Terms from "./Terms";

// function DraggableMarker({item}) {
//     const [draggable, setDraggable] = useState(true)
//     const [position, setPosition] = useState(item.coordinates)
//     const markerRef = useRef(null)
//     const eventHandlers = useMemo(
//         () => ({
//             dragend() {
//                 const marker = markerRef.current
//                 if (marker != null) {
//                     setPosition(marker.getLatLng())
//                 }
//             },
//         }),
//         [],
//     )
//     const toggleDraggable = useCallback(() => {
//         setDraggable((d) => !d)
//     }, [])
//
//     return (
//         <Marker
//             draggable={draggable}
//             eventHandlers={eventHandlers}
//             position={position}
//             ref={markerRef}>
//         {/*    <Popup minWidth={90}>*/}
//         {/*<span onClick={toggleDraggable}>*/}
//         {/*  {draggable*/}
//         {/*      ? 'Marker is draggable'*/}
//         {/*      : 'Click here to make marker draggable'}*/}
//         {/*</span>*/}
//         {/*    </Popup>*/}
//         </Marker>
//     )
// }

function MarkerControls() {
    // const [markerActive, setMarkerActive] = useState(false);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    return (
        <>
            {!user.isMarkerActive && <button className="btn btn-outline-primary mb-2" onClick={_ => {
                dispatch(setIsMarkerActive(true));
                dispatch(setMarkers([
                    {
                        coordinates: [46.947978, 7.440386]
                    }
                ]));
            }}>Add marker</button>}

            {user.isMarkerActive && <div className="mb-2">
                <button className="btn btn-primary mr-1" onClick={_ => {
                    // todo get current marker position
                    // todo send to fairos
                    dispatch(setIsMarkerActive(false));
                    dispatch(saveMarkers({
                        markers: [
                            {
                                coordinates: [46.947978, 7.440386]
                            }
                        ]
                    }));
                }
                }>
                    Save marker
                </button>

                <button className="btn btn-outline-primary" onClick={_ => {
                    dispatch(setIsMarkerActive(false));
                    dispatch(setMarkers([]));
                }
                }>
                    Cancel
                </button>
            </div>}
        </>
    );
}

function MyLayer({dispatch, initMarkers = []}) {
    // const user = useSelector(selectUser);
    const [markers, setMarkers] = useState(initMarkers);
    const addMarker = useCallback((e) => {
        const newMarker = {
            coordinates: [e.latlng.lat, e.latlng.lng],
        };
        console.log(newMarker);
        setMarkers((existingMarkers) => {
            const result = [...existingMarkers, newMarker];
            dispatch(saveMarkers({markers: result}));

            return result;
        });
    }, []);

    const map = useMapEvents({
        click(e) {
            addMarker(e);
        }
    })

    useEffect(() => {
        // setMarkers(defaultMarkers);
    }, [addMarker,
        // user.markers
    ]);


    return (
        <LayerGroup>
            {markers.map((marker, idx) => {
                return (
                    <Marker
                        key={idx}
                        position={marker.coordinates}
                    />
                );
            })}
        </LayerGroup>
    );
}

export default function App() {
    const catalog = useSelector(selectCatalog);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const location = useLocation();
    const path = location.pathname;
    const displayPrivateMap = useMemo(
        () => {
            return <>
                {/*<MarkerControls/>*/}
                {/*<button className="btn btn-primary-outline" onClick={_=>{*/}
                {/*    dispatch(saveMarkers({markers: []}));*/}
                {/*    dispatch(downloadMarkers());*/}

                {/*}*/}
                {/*}>Reset marks</button>*/}

                <MapContainer
                    whenCreated={async map => {
                        const tangramLayer = window.Tangram.leafletLayer({
                            scene: 'scene.yaml',
                            attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
                        });

                        tangramLayer.addTo(map);
                    }}
                    center={[46.948919, 7.440979]}
                    zoom={3}
                    scrollWheelZoom={false}>

                    {/*{user.markers.map(item => <DraggableMarker key={item.coordinates} item={item}/>)}*/}
                    <MyLayer dispatch={dispatch} initMarkers={user.markers}/>
                </MapContainer>
            </>
        },
        [catalog.activeItem,
            user.markers
        ],
    );
    const displayPublicMap = useMemo(
        () => {
            return <>
                <MapContainer
                    whenCreated={async map => {
                        const tangramLayer = window.Tangram.leafletLayer({
                            scene: 'public-scene.yaml',
                            attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
                        });

                        tangramLayer.addTo(map);
                    }}
                    center={[46.948919, 7.440979]}
                    zoom={3}
                    scrollWheelZoom={false}>

                    {/*{user.markers.map(item => <DraggableMarker key={item.coordinates} item={item}/>)}*/}
                    {/*<MyLayer dispatch={dispatch} initMarkers={user.markers}/>*/}
                </MapContainer>
            </>
        },
        [catalog.activeItem,
            user.markers
        ],
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
                    // (user.isLoggedIn && user.indexed) ? (
                    (user.isLoggedIn) ? (
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

    console.log('user.indexStatus',user)
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

                    <Route path="/map">
                        {user.indexStatus === 'ready' && (user.isLoggedIn ? displayPrivateMap : displayPublicMap)}
                        {user.indexStatus === 'rejected' &&
                            <p>Maps not found. <Link to="/catalog">Add</Link> some maps to your account.</p>}
                        {user.indexStatus === 'loading' && <p>Loading maps info...</p>}
                    </Route>

                    <Route path="/about">
                        <About/>
                    </Route>

                    <Route path="/terms">
                        <Terms/>
                    </Route>

                    <Route path="/catalog">
                        <Catalog/>
                    </Route>

                    <Route path="/registration">
                        <Registration/>
                    </Route>

                    <Route path="/registry">
                        <Registry/>
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
