import {useDispatch, useSelector} from "react-redux";
import {getListAsync, selectCatalog} from "./catalogSlice";
import {useEffect} from "react";

export default function Catalog() {
    const catalog = useSelector(selectCatalog);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getListAsync());
    }, []);

    return <div className="App-catalog">
        {catalog.status === 'loading' && <p>Loading...</p>}
        {catalog.list.map(item => <p key={item.id}>{item.title}</p>)}
    </div>;
}
