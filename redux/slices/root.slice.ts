import { createSlice } from "@reduxjs/toolkit";
import Resume from "../../constants/resume";

export const rootSlice = createSlice({
    name: 'root',
    initialState: Resume,
    reducers: {
    }
})