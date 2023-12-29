import Authorize from "./components/authorizeUser";
import { Route, Routes } from "react-router-dom";
import LoginScreen from "./components/loginScreen";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Authorize />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        limit={5}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="light"
      />
    </>
  );
}

export default App;
