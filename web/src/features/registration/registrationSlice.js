import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import FairOS from "../../service/FairOS";
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
        const api = new FairOS();
        let response;
        try {
            response = await api.signup(username, password, mnemonic);
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
