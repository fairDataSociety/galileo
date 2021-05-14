import {useDispatch, useSelector} from "react-redux";
import {getListAsync, selectCatalog, setList} from "./catalogSlice";
import {useEffect} from "react";

export default function Catalog() {
    const catalog = useSelector(selectCatalog);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setList([]));
        dispatch(getListAsync());
    }, []);

    return <div className="App-catalog">
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
                    <button className="btn btn-success btn-sm" onClick={_ => {
                        // todo after login open some pod with info about available maps
                        // todo show somewhere control page for countries
                        // todo if user not registered ask if he wants to register or login (modal window with options)
                        // todo if user registered check if this pod added to his pods
                        if (window.confirm('Add this map to your pod?')) {
                            // todo implement
                            console.log(item);
                        }
                    }}>
                        View
                    </button>
                </td>
            </tr>)}

            {catalog.status === 'loading' && <tr key={0}>
                <td>Loading...</td>
            </tr>}

            </tbody>
        </table>
    </div>;
}
