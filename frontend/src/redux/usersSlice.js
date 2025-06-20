import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "users", // This goes here
  initialState: {
    user: null, // This is where you'll store logged-in user data
    reloadUser: false,
  },
  reducers: {
    SetUser(state, action) {
      state.user = action.payload;
    },
    ReloadUser(state, action) {
      state.reloadUser = action.payload;
    },
  },
});

export const { SetUser, ReloadUser } = usersSlice.actions;
export default usersSlice.reducer;
