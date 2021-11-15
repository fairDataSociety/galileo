import {useDispatch, useSelector} from "react-redux";
import {
    addRegistry,
    deleteLocal,
    getListAsync,
    selectRegistry, setActiveItem,
    setList
} from "./registrySlice";
import {useEffect, useState} from "react";
import {login, selectUser, setRegistry} from "../user/userSlice";
import {Link} from "react-router-dom";
import {Button, Modal} from "react-bootstrap";

export default function Registry() {
    const [showUpload, setShowUpload] = useState(false);
    const [showAddMap, setShowAddMap] = useState(false);
    const [registryReference, setRegistryReference] = useState('');
    const [mapTitle, setMapTitle] = useState('');

    const state = useSelector(selectRegistry);
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const actionsDisabled = !['idle', 'error'].includes(state.status);

    const isAddMapDisabled = () => {
        return !registryReference ||
            registryReference.length !== 128 ||
            !mapTitle;
    }

    useEffect(() => {
        dispatch(setList([]));
        dispatch(getListAsync());
    }, []);

    return <div className="App-registry">
        <Modal show={showUpload} onHide={_ => setShowUpload(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add registry</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Please, follow "How to create and share your own map?" instruction: <a
                target="_blank"
                href="https://github.com/fairDataSociety/osm-example">https://github.com/fairDataSociety/Galileo</a>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={_ => setShowUpload(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>

        <Modal show={showAddMap} onHide={_ => setShowAddMap(false)} onShow={_ => {
            setRegistryReference('');
            setMapTitle('');
        }}>
            <Modal.Header closeButton>
                <Modal.Title>Add registry</Modal.Title>
            </Modal.Header>
            <form onSubmit={e => {
                e.preventDefault();
                dispatch(addRegistry({reference: registryReference, title: mapTitle}));
                setShowAddMap(false);
            }}>
                <Modal.Body>
                    <fieldset>
                        <div className="mb-3">
                            <label className="form-label">FairOS registry reference</label>
                            <input type="text" className="form-control"
                                   placeholder="07bcccde50709ba2b444b9dd20607dcee7f7fd8a8ada9287652217448f3228d3d72f0fdc58ae2e463f1373e92ea6c9ad09903ab408adf0a2f0149b11b178146c"
                                   onChange={e => setRegistryReference(e.target.value)}
                                   value={registryReference}/>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input type="text" className="form-control"
                                   placeholder="DAO Registry"
                                   onChange={e => setMapTitle(e.target.value)}
                                   value={mapTitle}/>
                        </div>
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

        {(state.status === 'error' && state.statusText) &&
        <div className="alert alert-danger" role="alert">
            {state.statusText}
        </div>}

        <h3>Registries</h3>
        <p>Registry is a container for maps that is managed by a third party organization or algorithm. You can manage
            the registries you trust. The default registry is managed by Fair Data Society.</p>

        {!user.isLoggedIn &&
        <p>Please <Link to="/login">login</Link> or <Link to="/registration">register</Link> to use this page.</p>}

        {user.isLoggedIn && <div className="mb-3">
            {/*<button onClick={_ => setShowUpload(true)} className="btn btn-outline-primary">Upload map</button>*/}
            <button onClick={_ => setShowAddMap(true)} className="btn btn-outline-primary ml-1">
                Add registry
            </button>
        </div>}

        {user.isLoggedIn && <table className="table">
            <thead>
            <tr>
                <th scope="col">Registry</th>
                <th scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>

            {state.list.map(item => <tr key={item.title}>
                <td>
                    {item.type === 'default' ?
                        <span className="badge badge-success">Default</span> :
                        <span className="badge badge-light">Custom</span>}
                    &nbsp;{item.title}</td>
                <td>
                    {(user.isLoggedIn) &&
                    <button className="btn btn-success btn-sm"
                            disabled={state.activeItem?.id === item.id || actionsDisabled || state.list.length <= 1}
                            onClick={_ => {
                                dispatch(setActiveItem(item));
                                dispatch(setRegistry(item));
                            }}>
                        Use
                    </button>}

                    {(user.isLoggedIn && item.isCustom) &&
                    <button className="btn btn-danger btn-sm ml-1"
                            onClick={_ => {
                                if (window.confirm('Really delete?')) {
                                    dispatch(deleteLocal(item.id));
                                }
                            }}>
                        Delete
                    </button>}

                    {/*{(!user.isLoggedIn || state.list.length <= 1) &&*/}
                    {/*<p>...</p>}*/}
                </td>
            </tr>)}

            {state.status === 'loading' && <tr key={0}>
                <td>Loading...</td>
            </tr>}

            </tbody>
        </table>}
    </div>;
}
