import userReducer from "./userReducer/userReducer"; // Import your user reducer
import { applyMiddleware, createStore } from "redux";
import { createLogger } from "redux-logger";

const loggerMiddleware = createLogger();

const store = createStore(userReducer, applyMiddleware(loggerMiddleware));

// const store = configureStore({
//   reducer: {
//     user: userReduces, // Add your user reducer here
//     middleware: [logger],
//     // You can add more reducers if needed
//   },
// });

export default store;
