import { combineReducers } from '@reduxjs/toolkit'
import { rootSlice } from './slices/root.slice';
export const rootReducer = combineReducers({
    root: rootSlice.reducer
})
export type RootState = ReturnType<typeof rootReducer>
export default rootReducer;