import React, { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { Link } from "react-router-dom";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";
import RefreshToken from './RefreshToken';
import Logout from "./Logout.js";

const Editemail = () => 
{
  let userDetails = JSON.parse(sessionStorage.getItem("details"));
  let user_JWT_token = null;
  if(userDetails)
    user_JWT_token = userDetails.jwt_token;
  else
    window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self');

  const [email, setemail] = useState(userDetails.email);
  const [emailError, setEmailError] = useState("");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logout, setLogout] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  const validateEmail = (value) => 
  {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  };


  async function editEmail() 
  {
    console.log("EMAIL EDIT FUNCTION", emailError);
    if (!validateEmail(email)) {
      setPopupTitle("Invalid Email");
      setPopupText("Please enter a valid email");
      setOpen(true);
      setSuccess(false);
      return;
    }

    setEmailError("");
    let item = {
      email,
    };
    console.log(item);
    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/edit-email`, {
      method: "POST",
      body: JSON.stringify(item),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${user_JWT_token}`,
      },
    });
    const data = await result.json();

    if(data.error)
    {
      setPopupTitle("Error");
      setPopupText(data.error);
      setOpen(true);
      setSuccess(false);
    }
    else
    {
      if(data.message === "jwt expired")
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
          editEmail();
        }
      }
      else
      {
        userDetails.email = email;
        sessionStorage.setItem("details", JSON.stringify(userDetails));
        setPopupTitle("Success!");
        setPopupText("Email has been updated successfully.");
        setOpen(true);
        setSuccess(true);
      }
    }
    
    return;
  }

  return (
    <>
      <div className="container">
        <center>
          <div className="edittext">Edit Email Address</div>
          <div className="underline"></div>
        </center>
        <div className="inputs">
          <div className="input" style={{ width: "450px" }}>
            <HiOutlineMail className="icons" />
            <input
           
              type="email"
              placeholder="Enter Email*"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              // This field will be filled in Automatically value="email@gmail.com"
            />
          </div>
        </div>
        <div className="submit-container">
          <button
            className="submit"
            onClick={() => {
              console.log("The Email address Details are modified");
              editEmail();
            }}
          >
            Edit Email Address
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

export default Editemail;
