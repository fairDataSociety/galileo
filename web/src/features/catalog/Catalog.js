import {useDispatch, useSelector} from "react-redux";
import {
    addRemoveMap,
    addSharedAndSwitch,
    deleteLocal,
    downloadAndSwitch,
    getListAsync,
    selectCatalog,
    setList
} from "./catalogSlice";
import {useEffect, useState} from "react";
import {login, selectUser} from "../user/userSlice";
import {Link} from "react-router-dom";
import {Button, Modal} from "react-bootstrap";

export default function Catalog() {
    const [showUpload, setShowUpload] = useState(false);
    const [showAddMap, setShowAddMap] = useState(false);
    const [mapReference, setMapReference] = useState('');
    const [mapTitle, setMapTitle] = useState('');
    const [mapCoordinates, setMapCoordinates] = useState('46.947978, 7.440386');
    const [currentItem, setCurrentItem] = useState({});
    const [processMap, setProcessMap] = useState({});

    const catalog = useSelector(selectCatalog);
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const actionsDisabled = !['idle', 'error'].includes(catalog.status);

    const isAddMapDisabled = () => {
        return !(mapReference &&
            (mapReference.length === 128 || mapReference.length === 64) &&
            mapTitle &&
            mapCoordinates &&
            mapCoordinates.split(',').length === 2);
    }

    useEffect(() => {
        dispatch(setList([]));
        // if (user.registry.pod_name) {
        dispatch(getListAsync());
        // }
    }, [user.registry]);

    return <div className="App-catalog">
        <Modal show={showUpload} onHide={_ => setShowUpload(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Upload map</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Please, follow "How to create and share your own map?" instruction: <a
                target="_blank"
                href="https://github.com/fairDataSociety/Galileo">https://github.com/fairDataSociety/Galileo</a>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={_ => setShowUpload(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>

        <Modal show={showAddMap} onHide={_ => setShowAddMap(false)} onShow={_ => {
            setMapReference('');
            setMapTitle('');
            // setMapCoordinates('');
        }}>
            <Modal.Header closeButton>
                <Modal.Title>Add map</Modal.Title>
            </Modal.Header>
            <form onSubmit={e => {
                e.preventDefault();
                dispatch(addSharedAndSwitch({reference: mapReference, title: mapTitle, coordinates: mapCoordinates}));
                setShowAddMap(false);
            }}>
                <Modal.Body>
                    <fieldset>
                        <div className="mb-3">
                            <label className="form-label">FairOS map reference</label>
                            <input type="text" className="form-control"
                                   placeholder="07bcccde50709ba2b444b9dd20607dcee7f7fd8a8ada9287652217448f3228d3d72f0fdc58ae2e463f1373e92ea6c9ad09903ab408adf0a2f0149b11b178146c"
                                   onChange={e => setMapReference(e.target.value)}
                                   value={mapReference}/>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input type="text" className="form-control"
                                   placeholder="Switzerland"
                                   onChange={e => setMapTitle(e.target.value)}
                                   value={mapTitle}/>
                        </div>

                        {/*<div className="mb-3">*/}
                        {/*    <label className="form-label">Initial coordinates</label>*/}
                        {/*    <input type="text" className="form-control"*/}
                        {/*           placeholder="46.947978, 7.440386"*/}
                        {/*           onChange={e => setMapCoordinates(e.target.value)}*/}
                        {/*           value={mapCoordinates}/>*/}
                        {/*</div>*/}
                    </fieldset>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={_ => setShowAddMap(false)}>
                        Close
                    </Button>

                    <button type="submit" className="btn btn-primary"
                            disabled={isAddMapDisabled()}>
                        {user.status === 'login' ? <span className="spinner-border spinner-border-sm" role="status"
                                                         aria-hidden="true"/> : ''}
                        &nbsp;Submit
                    </button>
                </Modal.Footer>
            </form>
        </Modal>

        {catalog.activeItem &&
            <div className="alert alert-success" role="alert">
                Active map: "{catalog.activeItem.title}". <Link to="/map">Go to map to view</Link>
            </div>}

        {(catalog.status === 'error' && catalog.statusText) &&
            <div className="alert alert-danger" role="alert">
                {catalog.statusText}
            </div>}

        <h3>Maps catalog</h3>
        <p>In maps catalog page you can choose which countries should be displayed on the map.</p>

        {!user.isLoggedIn &&
            <p>Please <Link to="/login">login</Link> or <Link to="/registration">register</Link> to use this page.</p>}

        {user.isLoggedIn && <div className="mb-3">
            <button onClick={_ => setShowUpload(true)} className="btn btn-outline-primary">Upload map</button>
            <button onClick={_ => setShowAddMap(true)} className="btn btn-outline-primary ml-1">Add map by reference
            </button>
        </div>}

        {user.isLoggedIn && <table className="table">
            <thead>
            <tr>
                <th scope="col">Country</th>
                <th scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>

            {catalog.list.map(item => <tr key={item.title}>
                <td>
                    {item.title}
                    {(user.isLoggedIn && item.isCustom) &&
                        <button className="btn btn-link btn-sm ml-1"
                                onClick={_ => {
                                    if (window.confirm('Really delete?')) {
                                        dispatch(deleteLocal(item.id));
                                    }
                                }}>
                            Delete
                        </button>}
                </td>
                <td>
                    {/*{user.isLoggedIn &&*/}
                    {/*<button className="btn btn-success btn-sm"*/}
                    {/*        disabled={catalog.activeItem?.id === item.id || actionsDisabled}*/}
                    {/*        onClick={_ => {*/}
                    {/*            if (window.confirm('Download map to your account and switch to it?')) {*/}
                    {/*                setCurrentItem(item);*/}
                    {/*                dispatch(downloadAndSwitch(item))*/}
                    {/*            }*/}
                    {/*        }}>*/}
                    {/*    {(catalog.status !== 'idle' && currentItem.id === item.id) ?*/}
                    {/*        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/> : ''}*/}
                    {/*    &nbsp;Switch*/}
                    {/*</button>}*/}
                    {user.isLoggedIn &&
                        <div className="custom-control custom-checkbox" onClick={_ => {
                            console.log('clicked', catalog.status);
                            setProcessMap(item);
                            dispatch(addRemoveMap(item));
                        }
                        }>
                            <input type="checkbox" className="custom-control-input"
                                   checked={item.checked}
                                   onChange={_ => {
                                   }} disabled={catalog.status === 'adding'}/>
                            <label className="custom-control-label">
                                {catalog.status === 'adding' && (processMap.title === item.title ?
                                    <span className="spinner-border spinner-border-sm" role="status"
                                          aria-hidden="true"/> : '')}&nbsp;Display on the map
                            </label>
                        </div>}

                    {/*{!user.isLoggedIn &&*/}
                    {/*<button className="btn btn-success btn-sm"*/}
                    {/*        disabled={actionsDisabled}*/}
                    {/*        onClick={_ => {*/}
                    {/*            alert('To view the map you need to login or register');*/}
                    {/*            // todo redirect to login or show modal with login/auth*/}
                    {/*        }}>*/}
                    {/*    View*/}
                    {/*</button>}*/}

                    {!user.isLoggedIn &&
                        <p>...</p>}
                </td>
            </tr>)}

            {catalog.status !== 'loading' && user.registry?.reference && catalog.list.length === 0 && <tr key={0}>
                <td>No maps found</td>
            </tr>}

            {(!user.registry?.reference) && <tr key={0}>
                <td>Loading registry info...</td>
            </tr>}

            {(catalog.status === 'loading' && catalog.list.length === 0) && <tr key={0}>
                <td>Loading list of maps...</td>
            </tr>}

            </tbody>
        </table>}
    </div>;
}
