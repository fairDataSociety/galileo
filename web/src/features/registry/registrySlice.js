import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchRegistriesList} from "./registryAPI";
import {getFairOSInstance} from "../../service/SharedData";
import * as local from "../../service/LocalData";
import {removeRegistry} from "../../service/LocalData";
import {getRandomInt} from "../../service/Utils";
import {setRegistry} from "../user/userSlice";
import {openAll} from "../../service/FairOSUtility";

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

export const addRegistry = createAsyncThunk(
    'registry/addRegistry',
    async (data, {dispatch, getState}) => {
        const {reference, title} = data;
        const user = getState().user;
        const api = getFairOSInstance();
        // dispatch(setStatus('pod_receive_info'));
        const info = await api.podReceiveInfo(reference);
        await api.podReceive(reference);
        const pod = info?.pod_name;
        if (!pod) {
            throw new Error("Pod information not found");
        }

        const obj = {id: reference, title, pod_name: pod, reference};
        // todo check if exists in local storage and state, catch is already exists
        local.addRegistry(obj);
        dispatch(setRegistry(obj));
        dispatch(getListAsync());
        await openAll(user.password);

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
            // .addCase(addRemoveMap.rejected, (state, action) => {
            //     console.log('addRemoveMap rejected', action.error)
            // })
            // .addCase(addRemoveMap.fulfilled, (state, action) => {
            //     state.status = 'idle';
            //     state.list = action.payload;
            // })
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
