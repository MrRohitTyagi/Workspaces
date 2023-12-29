import Authorize from "./components/authorizeUser";
import { Route, Routes } from "react-router-dom";
import LoginScreen from "./components/loginScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Authorize />} />
      <Route path="/login" element={<LoginScreen />} />
    </Routes>
  );
}

export default App;
