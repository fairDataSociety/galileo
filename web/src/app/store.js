import {configureStore} from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import catalogReducer from '../features/catalog/catalogSlice';
import registrationReducer from '../features/registration/registrationSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        catalog: catalogReducer,
        registration: registrationReducer,
    },
});
