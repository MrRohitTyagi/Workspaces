/* eslint-disable react/prop-types */
import { memo, useCallback, useState } from "react";
import { toast } from "react-toastify";
import Textarea from "@mui/joy/Textarea";

import Dialog from "@mui/material/Dialog";
import { Button, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

import { createEmail, searchEmail } from "../../controllers/emailController";
import "./componeEmail.css";
import { styled } from "@mui/material/styles";

const StyledTextArea = styled(Textarea)`
  > textarea {
    overflow: auto !important;
  }
`;
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
        if (perEmail.id !== email.id) {
          arr.push(perEmail);
        }
      }
      return [...arr];
    });
  }, [email.id, setNewEmailsToSend]);

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
      recipients: to.map((e) => e.value),
      archivedBy: [],
      starredBy: [],
    };
    await createEmail(payload);
    filterEmails(id);
    handleClose();
    toast.success(`Email Sent!`);
  };

  const handleRecipientsOnchange = useCallback((val) => {
    setFormData((prev) => {
      return { ...prev, to: val };
    });
  }, []);
  console.log("formData", formData);
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
              <CustomSelect
                to={formData.to || []}
                handleRecipientsOnchange={handleRecipientsOnchange}
              />
              <TextField
                size="small"
                value={formData.subject}
                onChange={handleChange}
                sx={{ width: "100%", borderBottom: "1px solid rgba()" }}
                placeholder="Subject"
                id="subject"
                name="subject"
              />
              <StyledTextArea
                onFocus={(e) => (e.target.style.outline = "none")}
                value={formData.body}
                onChange={handleChange}
                minRows={2}
                name="body"
                sx={{
                  padding: "15px",
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

import AsyncSelect from "react-select/async";

import { debounce } from "lodash";

const CustomSelect = memo(({ handleRecipientsOnchange, to = [] }) => {
  const [selectedOptions, setSelectedOptions] = useState(to);

  const debouncedLoadOptions = debounce(async (inputValue, callback) => {
    try {
      const { response = [] } = await searchEmail(inputValue);

      const options = response.map((r) => ({
        label: r.email,
        value: r.email,
      }));

      callback(options);
    } catch (error) {
      console.error("Error fetching options:", error);
      callback([]);
    }
  }, 500);

  const loadOptions = (inputValue, callback) => {
    debouncedLoadOptions(inputValue, callback);
  };
  const handleChange = useCallback(
    (selectedValues) => {
      setSelectedOptions(selectedValues);

      handleRecipientsOnchange(selectedValues);
    },
    [handleRecipientsOnchange]
  );

  return (
    <AsyncSelect
      isMulti
      labelKey="email"
      value={selectedOptions}
      loadOptions={loadOptions}
      onChange={handleChange}
      isClearable
      placeholder="Type to search and select"
    />
  );
});

CustomSelect.displayName = "CustomSelect";

export default EmailDialogue;
