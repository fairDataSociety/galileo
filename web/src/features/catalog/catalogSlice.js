import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchCatalogList} from "./catalogAPI";
import FairOS from "../../service/FairOS";

const initialState = {
    status: 'idle',
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

export const downloadAndSwitch = createAsyncThunk(
    'catalog/downloadAndSwitch',
    async (item, {dispatch, getState}) => {
        const {pod, kv, reference} = item;
        const user = getState().user;
        const api = new FairOS();
        dispatch(setStatus('pod_receive'));
        await api.podReceive(reference);
        dispatch(setStatus('pod_open'));
        let response = await api.podOpen(pod, user.password);
        if (response.code !== 200) {
            throw new Error("Can't open pod");
        }

        dispatch(setStatus('kv_open'));
        await api.kvOpen(kv);
        if (response.code !== 200) {
            throw new Error("Can't open key value storage");
        }

        window._fair_pod = pod;
        window._fair_kv = kv;
        localStorage.setItem('osm_active', JSON.stringify(item))
        dispatch(setActiveItem(item));

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
            .addCase(downloadAndSwitch.rejected, (state, action) => {
                state.status = 'idle';
            })
            .addCase(downloadAndSwitch.fulfilled, (state, action) => {
                state.status = 'idle';
            });
    },
});

export const {setList, setStatus, setActiveItem} = catalogSlice.actions;
export const selectCatalog = (state) => state.catalog;
export const selectCatalogList = (state) => state.catalog.list;
export default catalogSlice.reducer;
