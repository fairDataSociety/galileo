import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {getFairOSInstance} from "../../service/SharedData";
import {updateIndexes} from "../user/userSlice";

const initialState = {
    status: 'idle',
    statusText: '',
    username: '',
    password: '',
    mnemonic: '',
};

export const registrationAsync = createAsyncThunk(
    'registration/registrationAsync',
    async ({username, password, mnemonic}, {dispatch}) => {
        const api = getFairOSInstance();
        let response;
        try {
            response = (await api.userSignup(username, password, mnemonic)).data;
        } catch (e) {
            throw new Error(`${e.message}. Please, check your internet connection`);
        }

        if (!response.address) {
            throw new Error(response.message ? response.message : 'Server response error');
        }

        localStorage.setItem('osm_username', username);
        localStorage.setItem('osm_password', password);

        dispatch(updateIndexes({password}));

        return response;
    }
);

export const registrationSlice = createSlice({
    name: 'registration',
    initialState,
    reducers: {
        reset: (state, action) => {
            state.status = 'idle';
            state.statusText = '';
            state.username = '';
            state.password = '';
            state.mnemonic = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registrationAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(registrationAsync.fulfilled, (state, action) => {
                state.status = 'registered';
            })
            .addCase(registrationAsync.rejected, (state, action) => {
                state.status = 'error';
                state.statusText = `Error: "${action.error.message}"`;
            });
    },
});

export const {reset} = registrationSlice.actions;
export const selectRegistration = (state) => state.registration;
export default registrationSlice.reducer;
