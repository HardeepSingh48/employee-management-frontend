import { configureStore } from '@reduxjs/toolkit';
import employeeSlice from './employee-slice';
import authSlice from './auth-slice';

export const store = configureStore({
  reducer: {
    employees: employeeSlice,
    auth: authSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;