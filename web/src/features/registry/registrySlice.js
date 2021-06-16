import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchRegistriesList} from "./registryAPI";
import FairOS from "../../service/FairOS";
import {
    addPodToIndex,
    getOsmIndex,
    removePodFromOsmIndex,
    removeRegistry,
    setWindowIndex
} from "../../service/LocalData";
import {getRandomInt} from "../../service/Utils";
import * as local from "../../service/LocalData";

const initialState = {
    status: 'idle',
    statusText: '',
    activeItem: null,
    list: []
};

export const getListAsync = createAsyncThunk(
    'registry/getListAsync',
    async () => {
        const response = await fetchRegistriesList();
        // The value we return becomes the `fulfilled` action payload
        return response.data;
    }
);

export const addRemoveMap = createAsyncThunk(
    'registry/addRemoveMap',
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

export const addRegistry = createAsyncThunk(
    'registry/addRegistry',
    async (data, {dispatch, getState}) => {
        const {reference, title} = data;
        const user = getState().user;
        const api = new FairOS();
        dispatch(setStatus('pod_receive_info'));
        const info = await api.podReceiveInfo(reference);
        const pod = info?.pod_name;
        if (!pod) {
            throw new Error("Pod information not found");
        }

        await api.podOpen(pod, user.password);
        const obj = {id: getRandomInt(10000, 100000), title, pod, reference};

        local.addRegistry(obj);
        dispatch(getListAsync());

        return true;
    }
);

export const registrySlice = createSlice({
    name: 'registry',
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
            .addCase(addRemoveMap.rejected, (state, action) => {
                console.log('addRemoveMap rejected', action.error)
            })
            .addCase(addRemoveMap.fulfilled, (state, action) => {
                state.status = 'idle';
                state.list = action.payload;
            })
            .addCase(addRegistry.rejected, (state, action) => {
                state.status = 'error';
                state.statusText = action.error.message;
            });
    },
});

export const deleteLocal = (id) => (dispatch) => {
    removeRegistry(id);
    dispatch(getListAsync());
};

export const {setList, setStatus, setActiveItem} = registrySlice.actions;
export const selectRegistry = (state) => state.registry;
export const selectRegistryList = (state) => state.registry.list;
export default registrySlice.reducer;
