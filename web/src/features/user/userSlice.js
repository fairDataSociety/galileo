import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import FairOS from "../../service/FairOS";
import {setActiveItem} from "../catalog/catalogSlice";
import {clearOsmIndex, getOsmIndex, saveOsmIndex, setWindowIndex} from "../../service/LocalData";
import {
    MAPS_DATA_KV,
    MAPS_DATA_KV_TABLE_POINTS,
    MAPS_DATA_POD,
    REGISTRY_KV_KEY_NAME,
    REGISTRY_KV_NAME
} from "../../service/SharedData";
import {getKvValue} from "../../service/Utils";

const initialState = {
    indexed: false,
    status: 'idle',
    statusText: '',
    isLoggedIn: false,
    username: '',
    password: '',
    pod: '',
    kv: '',
    registry: {},
    isMarkerActive: false,
    markers: []
};

async function importDefaultRegistry(dispatch, fairOS, password) {
    const reference = process.env.REACT_APP_DEFAULT_REGISTRY_REFERENCE;
    if (reference) {
        const registryInfo = await fairOS.podReceiveInfo(reference);
        const podName = registryInfo?.pod_name;
        if (!podName) {
            console.error(`Registry info not found: ${reference}`);
            return;
        }

        await fairOS.podReceive(reference);
        await fairOS.podOpen(podName, password);
        await fairOS.kvOpen(podName, REGISTRY_KV_NAME);
        let dataFromRegistry = await fairOS.kvGet(registryInfo.pod_name, REGISTRY_KV_NAME, REGISTRY_KV_KEY_NAME);
        dataFromRegistry = getKvValue(dataFromRegistry);
        for (let map of dataFromRegistry) {
            await fairOS.podReceive(map.reference);
        }

        dispatch(setRegistry({
            reference,
            pod_name: registryInfo.pod_name
        }));
    } else {
        console.error('REACT_APP_DEFAULT_REGISTRY_REFERENCE is not defined');
    }
}

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const login = createAsyncThunk(
    'user/login',
    async ({username, password}, {dispatch, getState}) => {
        const fairOS = new FairOS();
        const data = await fairOS.login(username, password);
        // await importDefaultRegistry(dispatch, fairOS, password);
        localStorage.setItem('osm_username', username);
        localStorage.setItem('osm_password', password);
        const isLoggedIn = data.code === 200;
        if (isLoggedIn) {
            // const index = await fairOS.getMapsIndex(password);
            dispatch(updateIndexes({password}));
            // saveOsmIndex(index);
        } else {
            clearOsmIndex();
        }

        dispatch(setUser({username, password, isLoggedIn}));

        return isLoggedIn;
    }
);

export const updateIndexes = createAsyncThunk(
    'user/updateIndexes',
    async ({password}, {dispatch, getState}) => {
        dispatch(downloadMarkers());
        dispatch(setIndexed(false));
        const fairOS = new FairOS();
        await importDefaultRegistry(dispatch, fairOS, password);
        await fairOS.openAll(password);
        const index = await fairOS.getMapsIndex(password);
        saveOsmIndex(index);
        setWindowIndex(getOsmIndex());
        dispatch(setIndexed(true));

        return true;
    }
);

export const saveMarkers = createAsyncThunk(
    'user/saveMarkers',
    async ({markers}, {dispatch, getState}) => {
        const user = getState().user;
        const fairOS = new FairOS();
        await fairOS.podNew(MAPS_DATA_POD, user.password);
        await fairOS.podOpen(MAPS_DATA_POD, user.password);
        await fairOS.kvNew(MAPS_DATA_POD, MAPS_DATA_KV);
        await fairOS.kvOpen(MAPS_DATA_POD, MAPS_DATA_KV);
        await fairOS.kvPut(MAPS_DATA_POD, MAPS_DATA_KV, MAPS_DATA_KV_TABLE_POINTS, JSON.stringify(markers));
        // await fairOS.fileDelete(MAPS_DATA_POD, '/info.json');
        // await fairOS.fileUpload(MAPS_DATA_POD, 'info.json', JSON.stringify(markers));
        return true;
    }
);

export const downloadMarkers = createAsyncThunk(
    'user/downloadMarkers',
    async (some, {dispatch, getState}) => {
        const user = getState().user;
        const fairOS = new FairOS();
        try {
            await fairOS.podNew(MAPS_DATA_POD, user.password);
            await fairOS.podOpen(MAPS_DATA_POD, user.password);
            await fairOS.kvOpen(MAPS_DATA_POD, MAPS_DATA_KV);
            let data = await fairOS.kvGet(MAPS_DATA_POD, MAPS_DATA_KV, MAPS_DATA_KV_TABLE_POINTS);
            data = getKvValue(data);
            // const dir = await fairOS.dirLs(MAPS_DATA_POD, '/');
            // console.log(dir);
            // const data = await fairOS.fileDownload(MAPS_DATA_POD, '/', 'info.json');
            console.log('downloaded markers', data);
            if (data && Array.isArray(data)) {
                dispatch(setMarkers(data));
            }
        } catch (e) {
            console.log(e)
        }

        return true;
    }
);

export const tryLogin = createAsyncThunk(
    'user/tryLogin',
    async (params, {dispatch, getState}) => {
        const fairOS = new FairOS();
        const username = localStorage.getItem('osm_username');
        const password = localStorage.getItem('osm_password');
        // let activeMap = localStorage.getItem('osm_active');
        if (!username || !password) {
            return false;
        }

        const data = await fairOS.login(username, password);
        // await importDefaultRegistry(dispatch, fairOS, password);
        const isLoggedIn = data.code === 200;
        // if (isLoggedIn) {
        //     await fairOS.openAll(password);
        // }
        //
        // setWindowIndex(getOsmIndex());
        dispatch(setUser({username, password, isLoggedIn}));
        if (isLoggedIn) {
            dispatch(updateIndexes({password}));
        }

        return isLoggedIn;
    }
);

export const userSlice = createSlice({
    name: 'user',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        setUser: (state, action) => {
            const {isLoggedIn, username, password, pod, kv} = action.payload;
            state.isLoggedIn = !!isLoggedIn;
            state.username = username;
            state.password = password;
            state.pod = pod ? pod : null;
            state.kv = kv ? kv : null;
        },
        fullReset: (state) => {
            state.isLoggedIn = false;
            state.username = '';
            state.password = '';
            state.pod = '';
            state.kv = '';
        },
        resetStatus: (state) => {
            state.status = '';
            state.statusText = '';
        },
        setRegistry: (state, action) => {
            state.registry = action.payload;
        },
        setIndexed: (state, action) => {
            state.indexed = action.payload;
        },
        setMarkers: (state, action) => {
            state.markers = action.payload;
        },
        setIsMarkerActive: (state, action) => {
            state.isMarkerActive = action.payload;
        }
    },
    // The `extraReducers` field lets the slice handle actions defined elsewhere,
    // including actions generated by createAsyncThunk or in other slices.
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'idle';
            })
            .addCase(login.pending, (state) => {
                state.status = 'login';
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'error';
                state.statusText = action.error.message;
            })

            .addCase(tryLogin.fulfilled, (state, action) => {
                state.status = 'idle';
            })
            .addCase(tryLogin.pending, (state) => {
                state.status = 'login';
            })
            .addCase(tryLogin.rejected, (state, action) => {
                state.status = 'error';
            })
            .addCase(downloadMarkers.rejected, (state, action) => {
                console.log(action);
            });
    },
});

export const {
    setUser,
    resetStatus,
    fullReset,
    setRegistry,
    setIndexed,
    setMarkers,
    setIsMarkerActive
} = userSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// export const selectCount = (state) => state.user.value;
export const selectUser = (state) => state.user;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const logout = () => (dispatch) => {
    dispatch(fullReset());
    dispatch(setActiveItem(null));
    localStorage.clear();
};

export default userSlice.reducer;
