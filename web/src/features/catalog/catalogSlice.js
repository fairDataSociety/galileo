import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchCatalogList} from "./catalogAPI";
import FairOS from "../../service/FairOS";
import {addPodToIndex, getOsmIndex, removePodFromOsmIndex, setWindowIndex} from "../../service/LocalData";

const initialState = {
    status: 'idle',
    statusText: '',
    activeItem: null,
    list: []
};

export const getListAsync = createAsyncThunk(
    'catalog/getListAsync',
    async () => {
        const response = await fetchCatalogList();
        // The value we return becomes the `fulfilled` action payload
        return response.data;
    }
);

export const addRemoveMap = createAsyncThunk(
    'catalog/addRemoveMap',
    async (podObject, {dispatch, getState}) => {
        dispatch(setStatus('adding'));
        console.log(podObject);
        const {pod} = podObject;
        const user = getState().user;
        const api = new FairOS();
        let isAdd = false;
        let list = [...getState().catalog.list].map(oldItem => {
            const item = {...oldItem};
            if (item.pod === pod) {
                item.checked = !item.checked;
                isAdd = item.checked;
            }

            return item;
        });
        console.log('isAdd', isAdd);
        if (isAdd) {
            // dispatch(setStatus('pod_open'));
            // await api.podOpen(pod, user.password);
            // dispatch(setStatus('kv_open'));
            // await api.kvOpen(kv);
            const podIndex = await api.getPodIndex(pod, user.password);
            if (podIndex) {
                addPodToIndex(podIndex);
                setWindowIndex(getOsmIndex());
            }
        } else {
            removePodFromOsmIndex(pod);
            setWindowIndex(getOsmIndex());

            // todo close pod
        }

        return list;
    }
);

// export const downloadAndSwitch = createAsyncThunk(
//     'catalog/downloadAndSwitch',
//     async (item, {dispatch, getState}) => {
//         const {pod, kv, reference} = item;
//         const user = getState().user;
//         const api = new FairOS();
//         dispatch(setStatus('pod_receive'));
//         await api.podReceive(reference);
//         dispatch(setStatus('pod_open'));
//         let response = await api.podOpen(pod, user.password);
//         if (response.code !== 200) {
//             throw new Error("Can't open pod");
//         }
//
//         dispatch(setStatus('kv_open'));
//         await api.kvOpen(kv);
//         if (response.code !== 200) {
//             throw new Error("Can't open key value storage");
//         }
//
//         window._fair_pod = pod;
//         window._fair_kv = kv;
//         localStorage.setItem('osm_active', JSON.stringify(item));
//         dispatch(setActiveItem(item));
//
//         return true;
//     }
// );

export const addSharedAndSwitch = createAsyncThunk(
    'catalog/addSharedAndSwitch',
    async (data, {dispatch, getState}) => {
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }

        const {reference, title, coordinates} = data;
        const coordinatesPrepared = coordinates.split(',');
        if (coordinatesPrepared.length !== 2) {
            throw new Error("Incorrect coordinates format");
        }

        const user = getState().user;
        const api = new FairOS();
        dispatch(setStatus('pod_receive_info'));
        const info = await api.podReceiveInfo(reference);
        const pod = info?.pod_name;
        if (!pod) {
            throw new Error("Pod information not found");
        }

        await api.podOpen(pod, user.password);
        const kvs = await api.kvLs();
        if (!kvs || !kvs.Tables || !kvs.Tables.length) {
            throw new Error("Key-value not found");
        }

        const kv = kvs.Tables[0].table_name;
        const obj = {id: getRandomInt(10000, 100000), title, coordinates: coordinatesPrepared, pod, kv, reference};
        // dispatch(downloadAndSwitch(obj));

        let customItems = localStorage.getItem('osm_custom_maps');
        console.log(customItems);
        if (customItems) {
            customItems = JSON.parse(customItems);
            customItems.push(obj);
        } else {
            customItems = [obj];
        }

        localStorage.setItem('osm_custom_maps', JSON.stringify(customItems));
        dispatch(getListAsync());

        return true;
    }
);

export const catalogSlice = createSlice({
    name: 'catalog',
    initialState,
    reducers: {
        setList: (state, action) => {
            state.list = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        setTitle: (state, action) => {
            state.title = action.payload;
        },
        setActiveItem: (state, action) => {
            state.activeItem = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getListAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getListAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                state.list = action.payload;
            })
            // .addCase(addRemoveMap.pending, (state) => {
            //     state.status = 'adding';
            // })
            .addCase(addRemoveMap.rejected, (state, action) => {
                console.log('addRemoveMap rejected', action.error)
            })
            .addCase(addRemoveMap.fulfilled, (state, action) => {
                state.status = 'idle';
                state.list = action.payload;
            })
            // .addCase(downloadAndSwitch.rejected, (state, action) => {
            //     state.status = 'idle';
            // })
            // .addCase(downloadAndSwitch.fulfilled, (state, action) => {
            //     state.status = 'idle';
            // })
            .addCase(addSharedAndSwitch.rejected, (state, action) => {
                state.status = 'error';
                state.statusText = action.error.message;
            });
    },
});

export const deleteLocal = (id) => (dispatch) => {
    let items = localStorage.getItem('osm_custom_maps');
    if (!items) {
        return;
    }

    items = JSON.parse(items);
    items = items.filter(item => item.id !== id);
    localStorage.setItem('osm_custom_maps', JSON.stringify(items));
    dispatch(getListAsync());
};

export const {setList, setStatus, setActiveItem} = catalogSlice.actions;
export const selectCatalog = (state) => state.catalog;
export const selectCatalogList = (state) => state.catalog.list;
export default catalogSlice.reducer;
