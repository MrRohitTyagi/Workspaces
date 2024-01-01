import { useCallback, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import "./loginscreen.css"; // Assuming you have a separate CSS file (App.css) for styling
import { IconButton, InputAdornment } from "@mui/material";
import { createUser, getUser } from "../../controllers/userController";
import { setCookie } from "../../utils/cookieHandler";
const varients = {
  hidden: { y: -50, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  transition: { duration: 1 },
};
function App() {
  const [isSigninForm, setIsSigninForm] = useState(false);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "t@t.com",
    password: "123456A",
  });

  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors = {};

    // Simple validation logic, you can customize as needed
    if (!formData.username.trim() && !isSigninForm) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (!/^(?=.*[A-Z]).{6,}$/.test(formData.password)) {
      newErrors.password =
        "Must contain 1 uppercase letter , \n Length must be greater than 6";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData.email, formData.password, formData.username, isSigninForm]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (validateForm()) {
        // Handle form submission logic here
        let user;
        if (isSigninForm) {
          const { response } = await getUser({ ...formData, type: "SIGN-IN" });
          user = response;
        } else {
          const { response } = await createUser({
            ...formData,
            type: "SIGN-UP",
          });
          user = response;
        }

        setCookie(user._id);
        toast.success(
          isSigninForm ? "Sign - Up Successful" : "Sign - In Successful"
        );
        // window.location.reload();
        window.location.href = "/";
      }
    },
    [formData, isSigninForm, validateForm]
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  return (
    <AnimatePresence>
      <div className="login-form-container">
        <div className="form-container-login">
          <form onSubmit={handleSubmit} className="login-actual-form">
            <motion.h2 animate={{ y: 0 }} initial={{ y: -50 }} className="tac">
              {isSigninForm ? "Sign - In" : "Sign - Up"}
            </motion.h2>
            <motion.div
              key={`${isSigninForm}`}
              variants={varients}
              exit={{ opacity: 0 }}
              animate="visible"
              initial="hidden"
              transition="transition"
            >
              {!isSigninForm && (
                <TextField
                  size="large"
                  label="Username"
                  error={errors.username}
                  helperText={errors.username}
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                />
              )}
            </motion.div>
            <motion.div
              variants={varients}
              animate="visible"
              initial="hidden"
              transition="transition"
            >
              <TextField
                label="Email"
                error={errors.email}
                helperText={errors.email}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                variant="standard"
                fullWidth
              />
            </motion.div>
            <motion.div
              variants={varients}
              animate="visible"
              initial="hidden"
              transition="transition"
            >
              <TextField
                label="Password"
                error={errors.password}
                helperText={errors.password}
                type={visible ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        onClick={() => setVisible((p) => !p)}
                      >
                        {visible ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onChange={handleChange}
                variant="standard"
                fullWidth
              />
            </motion.div>
            <motion.div
              variants={varients}
              animate="visible"
              initial="hidden"
              transition="transition"
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Submit
              </Button>
            </motion.div>
            <motion.div
              className="already-have-acc"
              variants={varients}
              animate="visible"
              initial="hidden"
            >
              <h6>Already have a account ?</h6>
              <h6 onClick={() => setIsSigninForm((prev) => !prev)}>
                {isSigninForm ? "Sign - Up" : "Sign - In"}
              </h6>
            </motion.div>
          </form>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default App;
