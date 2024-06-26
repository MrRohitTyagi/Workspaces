import * as Yup from "yup";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

import Textarea from "@mui/joy/Textarea";
import Dialog from "@mui/material/Dialog";
import { styled } from "@mui/material/styles";
import { Button, CircularProgress, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

import { createEmail, searchEmail } from "@/controllers/emailController";
import AsyncSelect from "react-select/async";

import { debounce, isEmpty } from "lodash";
import { multiupload } from "@/utils/imageupload";

import "./componeEmail.css";

const StyledTextArea = styled(Textarea)`
  > textarea {
    overflow: auto !important;
  }
`;
const validationSchema = Yup.object().shape({
  subject: Yup.string().required("Subject is required"),
  body: Yup.string().required("Body is required"),
  to: Yup.array()
    .of(Yup.object())
    .min(1, "At least one recipient is required")
    .required("Recipients are required"),
});

const EmailDialogue = memo(
  ({ open, user, email, setNewEmailsToSend, filterEmails }) => {
    const [formData, setFormData] = useState({
      ...email,
    });

    const [attachments, setAttachments] = useState(email.attachments || []);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      const validateForm = async () => {
        try {
          await validationSchema.validate(formData, { abortEarly: false });
          setErrors({});
        } catch (error) {
          const newErrors = {};
          error.inner.forEach((e) => {
            newErrors[e.path] = e.message;
          });
          setErrors(newErrors);
        }
      };

      validateForm();
    }, [formData]);

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

    const handleChange = useCallback(
      (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      },
      [formData]
    );

    const onSubmit = async (e) => {
      try {
        e.preventDefault();
        if (!isEmpty(errors)) return;
        setIsSubmitting(true);
        const { _id: sender } = user;

        const { body, subject, to, id } = formData;

        let imgUrlsArr = [];
        if (attachments.length > 0) {
          imgUrlsArr = await multiupload(attachments);
        }

        const payload = {
          sender,
          body,
          subject,
          recipients: to.map((e) => e.value),
          archivedBy: [],
          starredBy: [],
          attachments: imgUrlsArr,
        };
        await createEmail(payload);
        filterEmails(id);
        handleClose();
        toast.success(`Email Sent!`);
        setIsSubmitting(false);
      } catch (error) {
        setIsSubmitting(false);
        console.log("error", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleRecipientsOnchange = useCallback((val) => {
      setFormData((prev) => {
        return { ...prev, to: val };
      });
    }, []);

    const removeAttachment = useCallback((index) => {
      setAttachments((p) => {
        return p.filter((_, i) => i !== index);
      });
    }, []);
    const hasBodyErr = touched["body"] && errors["body"];
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
                  disabled={isSubmitting}
                  errors={errors}
                  setTouched={setTouched}
                  touched={touched}
                  to={formData.to || []}
                  handleRecipientsOnchange={handleRecipientsOnchange}
                />
                <TextField
                  disabled={isSubmitting}
                  onBlur={() =>
                    !touched["subject"] &&
                    setTouched((p) => ({ ...p, subject: true }))
                  }
                  error={touched["subject"] && errors["subject"]}
                  helperText={touched["subject"] && errors["subject"]}
                  size="small"
                  value={formData.subject}
                  onChange={handleChange}
                  sx={{ width: "100%", borderBottom: "1px solid rgba()" }}
                  placeholder="Subject"
                  id="subject"
                  name="subject"
                />
                <StyledTextArea
                  disabled={isSubmitting}
                  onBlur={() =>
                    !touched["body"] &&
                    setTouched((p) => ({ ...p, body: true }))
                  }
                  error={touched["body"] && errors["body"]}
                  helperText={touched["body"] && errors["body"]}
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
                {hasBodyErr && (
                  <div className="error-line">Recipients are required</div>
                )}
                <div className="new-email-submit-button">
                  <Button
                    disabled={isSubmitting}
                    sx={{ alignSelf: "center" }}
                    type="submit"
                    variant="contained"
                    endIcon={
                      isSubmitting ? (
                        <CircularProgress
                          className="close-svg"
                          size={"small"}
                        />
                      ) : (
                        <SendIcon />
                      )
                    }
                  >
                    {isSubmitting ? <>{"  Sending .."}</> : " Send"}
                  </Button>
                  <InputFileUpload
                    isSubmitting={isSubmitting}
                    attachments={attachments}
                    setAttachments={setAttachments}
                  />
                </div>
                <div
                  className="attachments-cont"
                  style={{ minHeight: attachments.length > 0 ? "70px" : "0px" }}
                >
                  {attachments.map((item, i) => (
                    <div className="image-container" key={i + "gfkgjfd"}>
                      <img
                        className="image-upload-per-email"
                        height={"50px"}
                        width={"50px"}
                        src={
                          typeof item === "string"
                            ? item
                            : URL.createObjectURL(item)
                        }
                        alt={"img"}
                        loading="lazy"
                      />
                      <div
                        onClick={() => removeAttachment(i)}
                        className="close-button"
                      >
                        <CloseIcon className="close-svg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    );
  }
);

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
const InputFileUpload = memo(({ setAttachments, isSubmitting }) => {
  const ref = useRef();

  return (
    <>
      <IconButton
        disabled={isSubmitting}
        component="label"
        variant="contained"
        size="small"
        fullWidth
        onClick={() => {
          ref.current.click();
        }}
      >
        <AttachFileIcon />
      </IconButton>

      <VisuallyHiddenInput
        ref={ref}
        accept=".jpg, .jpeg, .png"
        multiple={true}
        max={4}
        type="file"
        onChange={(e) => {
          setAttachments((prev) => [...prev, ...e.target.files]);
        }}
      />
    </>
  );
});

const CustomSelect = memo(
  ({
    handleRecipientsOnchange,
    to = [],
    setTouched,
    touched,
    errors,
    disabled,
  }) => {
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

    const loadOptions = useCallback(
      (inputValue, callback) => {
        debouncedLoadOptions(inputValue, callback);
      },
      [debouncedLoadOptions]
    );

    const handleChange = useCallback(
      (selectedValues) => {
        setSelectedOptions(selectedValues);

        handleRecipientsOnchange(selectedValues);
      },
      [handleRecipientsOnchange]
    );
    const hasError = errors["to"] && touched["to"];
    return (
      <>
        <AsyncSelect
          isDisabled={disabled}
          className={hasError ? "error-async" : ""}
          onBlur={() =>
            !touched["to"] && setTouched((p) => ({ ...p, to: true }))
          }
          isMulti
          labelKey="email"
          value={selectedOptions}
          loadOptions={loadOptions}
          onChange={handleChange}
          isClearable
          placeholder="Type to search and select"
        />
        {hasError && <div className="error-line">Recipients are required</div>}
      </>
    );
  }
);

EmailDialogue.propTypes = {
  open: PropTypes.bool,
  user: PropTypes.object,
  email: PropTypes.string,
  setNewEmailsToSend: PropTypes.func,
  filterEmails: PropTypes.func,
};
InputFileUpload.propTypes = {
  setAttachments: PropTypes.func,
  isSubmitting: PropTypes.bool,
};
CustomSelect.propTypes = {
  handleRecipientsOnchange: PropTypes.func,
  to: PropTypes.array,
  setTouched: PropTypes.func,
  touched: PropTypes.object,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
};

InputFileUpload.displayName = "InputFileUpload";
EmailDialogue.displayName = "EmailDialogue";
CustomSelect.displayName = "CustomSelect";

export default EmailDialogue;
