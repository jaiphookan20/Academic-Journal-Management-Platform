import React, { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";
import RefreshToken from './RefreshToken';
import Logout from "./Logout.js";

const Editpassword = () => 
{
  let userDetails = JSON.parse(sessionStorage.getItem("details"));
  let user_JWT_token = null;
  if(userDetails)
    user_JWT_token = userDetails.jwt_token;
  else
    window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self');

  const [username, setUserName] = useState(userDetails.username);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logout, setLogout] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  async function editPassword() {
    if (username === "" || password === "" || confirmPassword === "") 
    {
      setPopupTitle("Field(s) Left Blank");
      setPopupText("Please Enter all the Information");
      setOpen(true);
      setSuccess(false);
      return;
    }

    if (password !== confirmPassword) 
    {
      setPopupTitle("Password Mismatch");
      setPopupText("Passwords do not match");
      setOpen(true);
      setSuccess(false);
      return;
    }

    let item = {username,password};

    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/edit-credentials`, {
      method: "POST",
      body: JSON.stringify(item),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${user_JWT_token}`,
      },
    });
    const data = await result.json();

    if (data.error ==="Password should be atleast 8 characters long. Should contain one number, one small alphabet, one capital alphabet and a special character.") 
    {
      setPopupTitle("Invalid Password Selected");
      setPopupText("Password should be atleast 8 characters long. Should contain one number, one small alphabet, one capital alphabet and a special character.");
      setOpen(true);
      setSuccess(false);
      return;
    } 
    else if (data.message === "jwt expired") 
    {
      const loginRefreshStatus =  await RefreshToken();
      if(!loginRefreshStatus)
      {
        setPopupTitle("Login expired");
        setPopupText("Please try to login again from the home");
        setOpen(true);
        setLogout(true);
        setSuccess(true);
      }
      else
      {
        user_JWT_token = loginRefreshStatus;
        console.log("Refreshing login")
        editPassword();
      }
    }
    else
    {
      setPopupTitle("Credentials Updated");
      setPopupText("Password and Username is Updated.");
      setOpen(true);
      setSuccess(true);
    }
  }

  return (
    <>
      <div className="container">
        <center>
          <div className="edittext">Edit Username or Password</div>
          <div className="underline"></div>
        </center>
        <div className="inputs-container" style={{ marginBottom: "20px" }}>
          <div className="inputs">
            <div className="input">
              <FaRegUserCircle className="icons" />
              <input
                type="text"
                placeholder="Enter Username*"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                // This field will be filled in Automatically value="test"
              />
            </div>
            <div className="input">
              <RiLockPasswordFill className="icons" />
              <input
                type="password"
                placeholder="Enter New Password*"
                onChange={(e) => setPassword(e.target.value)}
                // This field will be filled in Automatically value="test"
              />
            </div>
            <div className="input">
              <RiLockPasswordFill className="icons" />
              <input
                type="password"
                placeholder="Confrim New Password*"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="submit-container">
          <button
            className="submit"
            onClick={() => {
              editPassword();
            }}
          >
            Update Password
          </button>
        </div>
        {open ? (
          success ? (
            <PopupSingleButton
              title={popupTitle}
              text={popupText}
              button_text={"Close"}
              button_listener={() => {
                if(logout)
                  Logout();
                else
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
        <center>
          <Link
            className="nav-link active"
            aria-current="page"
            to="/edit-account-details"
          >
            <button className="reroute">Previous Page</button>
          </Link>
          <Link className="nav-link active" aria-current="page" to="/">
            <button className="reroute">Return Home</button>
          </Link>
        </center>
      </div>
    </>
  );
};

export default Editpassword;
