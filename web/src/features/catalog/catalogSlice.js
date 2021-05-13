import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchCatalogList} from "./catalogAPI";

const initialState = {
    status: '',
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

export const catalogSlice = createSlice({
    name: 'catalog',
    initialState,
    reducers: {
        setUser: (state, action) => {

        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getListAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getListAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                state.list = action.payload;
            });
    },
});

export const {setUser} = catalogSlice.actions;
export const selectCatalog = (state) => state.catalog;
export const selectCatalogList = (state) => state.catalog.list;
export default catalogSlice.reducer;
