import {useDispatch, useSelector} from "react-redux";
import {downloadAndSwitch, getListAsync, selectCatalog, setList} from "./catalogSlice";
import {useEffect, useState} from "react";
import {selectUser} from "../user/userSlice";
import {Link} from "react-router-dom";

export default function Catalog() {
    const catalog = useSelector(selectCatalog);
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const actionsDisabled = catalog.status !== 'idle';

    const [currentItem, setCurrentItem] = useState({});

    useEffect(() => {
        dispatch(setList([]));
        dispatch(getListAsync());
    }, []);

    return <div className="App-catalog">
        {catalog.activeItem &&
        <div className="alert alert-success" role="alert">
            Active map: "{catalog.activeItem.title}". <Link to="/map">Go to map to view</Link>
        </div>}

        <table className="table">
            <thead>
            <tr>
                <th scope="col">Country</th>
                <th scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>

            {catalog.list.map(item => <tr key={item.id}>
                <td>{item.title}</td>
                <td>
                    {user.isLoggedIn &&
                    <button className="btn btn-success btn-sm"
                            disabled={catalog.activeItem?.id === item.id || actionsDisabled}
                            onClick={_ => {
                                if (window.confirm('Download map to your account and switch to it?')) {
                                    setCurrentItem(item);
                                    dispatch(downloadAndSwitch(item))
                                }
                            }}>
                        {(catalog.status !== 'idle' && currentItem.id === item.id) ?
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/> : ''}
                        &nbsp;Switch
                    </button>}

                    {!user.isLoggedIn &&
                    <button className="btn btn-success btn-sm"
                            disabled={actionsDisabled}
                            onClick={_ => {
                                alert('To view the map you need to login or register');
                                // todo redirect to login or show modal with login/auth
                            }}>
                        View
                    </button>}
                </td>
            </tr>)}

            {catalog.status === 'loading' && <tr key={0}>
                <td>Loading...</td>
            </tr>}

            </tbody>
        </table>
    </div>;
}
