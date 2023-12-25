import "./componeEmail.css";
import Textarea from "@mui/joy/Textarea";

import Dialog from "@mui/material/Dialog";
import { Box, Button, IconButton, Input } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { createEmail } from "../../controllers/emailController";
import SendIcon from "@mui/icons-material/Send";

export default function NewEmail({ open, setOpen, user, filterEmails, email }) {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const handleClose = () => {
    setOpen(false);
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  console.log(`%c email `, "color: green;border:1px solid green", email);
  const onSubmit = async (e) => {
    e.preventDefault();
    const { email: sender } = user;
    const { body, subject, to } = formData;
    const payload = {
      sender,
      body,
      subject,
      recipients: [to],
    };
    console.log(
      `%c payload `,
      "color: orange;border:2px dotted oranfe",
      payload
    );
    await createEmail(payload);
    filterEmails(email.id);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <Box sx={{ width: "500px", height: "500px" }}>
        <div className="heading-new">
          <h3>New Message</h3>
          <IconButton>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="form-container">
          <form onSubmit={onSubmit}>
            <div className="form-email">
              <Input
                value={formData.to}
                onChange={handleChange}
                name="to"
                sx={{ width: "100%" }}
                placeholder="To"
                id="to"
              />
              <Input
                value={formData.subject}
                onChange={handleChange}
                sx={{ width: "100%" }}
                placeholder="Subject"
                id="subject"
                name="subject"
              />
              <Textarea
                value={formData.body}
                onChange={handleChange}
                minRows={2}
                name="body"
                sx={{ width: "100%", height: "300px" }}
                placeholder="Body"
                id="body"
              />
              <Button type="submit" variant="contained" endIcon={<SendIcon />}>
                Send
              </Button>
            </div>
          </form>
        </div>
      </Box>
    </Dialog>
  );
}
