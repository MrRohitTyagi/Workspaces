/* eslint-disable react/prop-types */
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import Textarea from "@mui/joy/Textarea";

import Dialog from "@mui/material/Dialog";
import { Button, IconButton, Input } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

import { createEmail } from "../../controllers/emailController";
import "./componeEmail.css";

const EmailDialogue = ({
  open,
  user,
  email,
  setNewEmailsToSend,
  filterEmails,
}) => {
  const [formData, setFormData] = useState({
    ...email,
  });

  const handleClose = useCallback(() => {
    setNewEmailsToSend((prev) => {
      let arr = [];
      for (let i = 0; i < prev.length; i++) {
        const perEmail = prev[i];
        if (perEmail.id === email.id) {
          console.log("aya");
          arr.push({
            ...perEmail,
            ...formData,
            isOpen: false,
            [Date.now()]: Date.now(),
          });
        } else {
          arr.push(perEmail);
        }
      }
      console.log("arr", arr);
      return [...arr];
    });
  }, [email.id, formData, setNewEmailsToSend]);

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
    toast.success(`Email Sent!`);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="new-email-form-box">
        <div className="heading-new">
          <h4>New Message</h4>
          <Button onClick={handleClose}>
            <CloseIcon />
          </Button>
        </div>
        <div className="form-container">
          <form onSubmit={onSubmit}>
            <div className="form-email">
              <Input
                value={formData.to}
                onChange={handleChange}
                name="to"
                sx={{
                  width: "100%",
                  border: "none",
                }}
                placeholder="To"
                id="to"
              />
              <Input
                value={formData.subject}
                onChange={handleChange}
                sx={{ width: "100%", borderBottom: "1px solid rgba()" }}
                placeholder="Subject"
                id="subject"
                name="subject"
              />
              <Textarea
                onFocus={(e) => (e.target.style.outline = "none")}
                value={formData.body}
                onChange={handleChange}
                minRows={2}
                name="body"
                sx={{
                  padding: "0px",
                  width: "100%",
                  height: "300px",
                  border: "none",
                  boxShadow: "none",
                }}
                placeholder="Body"
                id="body"
              />
              <div className="new-email-submit-button">
                <Button
                  sx={{ alignSelf: "start" }}
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
                <IconButton size="small" disabled>
                  <AttachFileIcon />
                </IconButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default EmailDialogue;
