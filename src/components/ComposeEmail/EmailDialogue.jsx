import "./componeEmail.css";
import Textarea from "@mui/joy/Textarea";

import Dialog from "@mui/material/Dialog";
import { Box, Button, IconButton, Input } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { createEmail } from "../../controllers/emailController";
import SendIcon from "@mui/icons-material/Send";

export default function NewEmail({
  open,
  setOpen,
  user,
  email,
  setNewEmailCount,
  filterEmails,
}) {
  const [formData, setFormData] = useState({
    ...email,
  });

  const handleClose = (onlyClose = true) => {
    if (!onlyClose) {
      setNewEmailCount((prev) => {
        let arr = [];
        for (let i = 0; i < prev.length; i++) {
          const perEmail = prev[i];
          if (perEmail.id === email.id) {
            arr.push({ ...perEmail, ...formData });
          } else {
            arr.push(perEmail);
          }
        }
        return arr;
      });
    }
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const { email: sender } = user;

    const { body, subject, to, id } = formData;
    const payload = {
      sender,
      body,
      subject,
      recipients: [to],
      archivedBy: [],
      starredBy: [],
    };
    await createEmail(payload);
    filterEmails(id);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={() => handleClose(false)}>
      <Box sx={{ width: "500px", height: "500px" }}>
        <div className="heading-new">
          <h3>New Message</h3>
          <IconButton onClick={() => handleClose(false)}>
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
