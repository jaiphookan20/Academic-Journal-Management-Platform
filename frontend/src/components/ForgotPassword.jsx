import React from "react";
import { HiOutlineMail } from "react-icons/hi";
import { useState } from "react";
import "./Css/Spinner.css";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  async function resetPassword() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") {
      setPopupTitle("No Email Entered");
      setPopupText("Please Enter the Registered Email");
      setOpen(true);
      setSuccess(false);
      return;
    }

    if (!emailPattern.test(email)) {
      setPopupTitle("Invalid Email");
      setPopupText("Please Enter a Valid Email");
      setOpen(true);
      setSuccess(false);
      return;
    }

    const requestData = {
      email: email,
    };
    try {
      const result = await fetch(
        `http://${process.env.REACT_APP_API_HOST}:8080/client/forgot-password`,
        {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setShowSpinner(true); //
      setTimeout(() => {
        setShowSpinner(false);
      }, 4000);
      const data = await result.json();

      /* Added this bit below: */
      let message = "";
      if (data.error) {
        console.log("response from backend: data.error: " + data.error);
        message = data.error;
      } else {
        console.log("response from backend: data.message: " + data.message);
        message = data.message;
      }

      if (data.message === "No account found with that email.") {
        setPopupTitle(message);
        setPopupText(message);
        setOpen(true);
        setSuccess(false);
      } else {
        setPopupTitle(message);
        setPopupText(message);
        setOpen(true);
        setSuccess(false);
        setEmail("");
      }
    } catch (error) {
      setPopupTitle("Error!");
      setPopupText("An error occurred. Please try again.");
      setOpen(true);
      setSuccess(false);
    }
  }

  return (
    <>
      {showSpinner && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}
      <div className="container">
        <div className="inputs-container">
          <div className="input" style={{ marginTop: "20px" }}>
            <HiOutlineMail className="icons" />
            <input
              type="email"
              placeholder="Enter Registered Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <center>
          <div
            className="submit"
            style={{ marginTop: "20px", width: "50%" }}
            onClick={() => {
              resetPassword();
            }}
          >
            Click to Reset Password
          </div>
          {open ? (
            success ? (
              <PopupSingleButton
                title={popupTitle}
                text={popupText}
                button_text={"Close"}
                button_listener={() => {
                  window.location.href = "/";
                }}
              />
            ) : (
              <PopupSingleButton
                title={popupTitle}
                text={popupText}
                button_text={"Close"}
                button_listener={() => {
                  setOpen(false);
                }}
              />
            )
          ) : null}
        </center>
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
