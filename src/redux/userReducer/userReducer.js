// actionTypes.js
export const SET_USER = "SET_USER";
export const DELETE_EMAIL = "DELETE_EMAIL";

// actions.js
export const setUser = (user, type) => ({
  type: type,
  payload: user,
});

// reducer.js
const initialState = {
  user: {},
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case DELETE_EMAIL: {
      const emailIdToDelete = action.payload;
      let tempstate = { ...state };
      tempstate.user.emailContent = state.user.emailContent.filter(
        (e) => e._id !== emailIdToDelete
      );
      return {
        ...tempstate,
      };
    }
    default:
      return state;
  }
};

export default userReducer;
