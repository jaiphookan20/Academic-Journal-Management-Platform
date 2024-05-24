import React, { useState } from "react";
import "./Css/LoginSIgnup.css";
import { RiLockPasswordFill, RiUser3Fill } from "react-icons/ri";
import { FaRegUserCircle, FaSchool } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { IoMdFingerPrint } from "react-icons/io";
import { LiaTransgenderAltSolid } from "react-icons/lia"; // Ensure this icon import is correct
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";
//import Axios from 'axios';

const Signup = () => {
  const [action, setAction] = useState("Sign Up!");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [pronoun, setPronoun] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [institution_name, setInstitution_name] = useState("");
  const [orcid,setorcid] = useState("");
  const [fieldsEmpty, setFieldsEmpty] = useState(true);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");


  async function signup() 
  {
    let item = {
      username, first_name, last_name, email, institution_name, pronoun, password, orcid
    };

    // COnsole Items to avoid warnings 
    console.log(fieldsEmpty)
    console.log(item);


    let result = await fetch(
      `http://${process.env.REACT_APP_API_HOST}:8080/client/signup`,
      {
        method: "POST",
        body: JSON.stringify(item),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const data = await result.json();
    console.log("Response from backend:", data.error);
    if (data.error !== undefined) 
    {
      setPopupTitle("Signup Error");
      setPopupText(data.error);
      setOpen(true);
      setSuccess(false);
    } 
    else 
    {
      setPopupTitle("Success");
      setPopupText("Signup successful! Ready to Login!");
      setOpen(true);
      setSuccess(true);

      // Clear the fields after successful signup
      setFirst_name("");
      setLast_name("");
      setEmail("");
      setPronoun("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setInstitution_name("");
    }
  }

  const checkFieldsEmpty = () => {
    if (
      first_name === "" ||
      last_name === "" ||
      email === "" ||
      username === "" ||
      password === "" ||
      confirmPassword === "" ||
      institution_name === "" ||
      orcid === ""
    ) {
      setPopupTitle("Missing Mandatory Fields");
      setPopupText("You are missing one of the mandatory fields. They are indicated with a *");
      setOpen(true);
      setSuccess(false);
    } else {
      setFieldsEmpty(false);
    }
  };

  const handlePronounSelect = (e) => {
    setPronoun(e.target.value);
    e.target.classList.add("dark-text");
  };

  return (
    <div className="container">
      <center>
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>
      </center>
      <div className="inputs">
        <div className="inputs-container">
          <div className="left-container">
              <div className="input">
                <RiUser3Fill className="icons" />
                <input
                  type="text"
                  placeholder="Enter First Name*"
                  value={first_name}
                  onChange={(e) => setFirst_name(e.target.value)}
                  required={true}
                />
              </div>
          </div>
          <div className="right-container">
              <div className="input">
                <RiUser3Fill className="icons" />
                <input
                  type="text"
                  placeholder="Enter Last Name*"
                  value={last_name}
                  onChange={(e) => setLast_name(e.target.value)}
                />
              </div>
          </div>
        </div>

        <div className="inputs-container">
          <div className="left-container">
              <div className="input">
                <HiOutlineMail className="icons" />
                <input
                  type="email"
                  placeholder="Enter Email*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
          </div>
          <div className="right-container">
              <div className="dropdown">
                <LiaTransgenderAltSolid className="icons" />
                <select value={pronoun} onChange={handlePronounSelect}>
                  <option value="">Select your Pronouns*</option>
                  <option value="he/him">he/him</option>
                  <option value="she/her">she/her</option>
                  <option value="they/them">they/them</option>
                  <option value="other">other</option>
                </select>
              </div>
          </div>
        </div>

        <div className="inputs-container">
          <div className="left-container">
            <div className="input">
              <FaRegUserCircle className="icons" />
              <input
                type="text"
                placeholder="Enter Username*"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="right-container">
            <div className="input">
              <RiLockPasswordFill className="icons" />
              <input
                type="password"
                placeholder="Enter password*"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="inputs-container">
          <div className="left-container">
              <div className="input">
                <RiLockPasswordFill className="icons" />
                <input
                  type="password"
                  placeholder="Confirm password*"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
          </div>
          <div className="right-container">
              <div className="input">
                <FaSchool className="icons" />
                <input
                  type="text"
                  placeholder="Enter your Institution*"
                  value={institution_name}
                  onChange={(e) => setInstitution_name(e.target.value)}
                />
              </div>
          </div>
        </div>
        <div className="inputs-container">
        <div className="input">
                <IoMdFingerPrint className="icons" />
                <input
                  type="text"
                  placeholder="Enter Orcid*"
                  value={orcid}
                  onChange={(e) => setorcid(e.target.value)}
                />
              </div>
        </div>
      </div>
      {action === "Sign Up!" ? (
        <div />
      ) : (
        <div className="forgot-password">
          Forgot Password? <span>Click Here</span>
        </div>
      )}
      <div className="submit-container">
        <button
          className="submit"
          onClick={() => {
            setAction("Sign Up!");
            checkFieldsEmpty();
            signup(); 
          }}
        >
          Sign Up
        </button>
      </div>
      {open && (
        <PopupSingleButton
          title={popupTitle}
          text={popupText}
          button_text={success ? "Login" : "Close"}
          button_listener={() => {
            setOpen(false);
            if (success) {
              window.location.href = "/";
            }
          }}
        />
      )}
    </div>
  );
};

export default Signup;