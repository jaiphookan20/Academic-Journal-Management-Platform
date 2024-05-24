import React, { useState } from "react";
import { RiUser3Fill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { LiaTransgenderAltSolid } from "react-icons/lia";
import { FaSchool } from "react-icons/fa6";
import { IoMdFingerPrint } from "react-icons/io";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";
import RefreshToken from './RefreshToken';
import Logout from "./Logout.js";


const EditAccount = () => 
{
  let userDetails = JSON.parse(sessionStorage.getItem("details"));
  let user_JWT_token = null;
  if(userDetails)
    user_JWT_token = userDetails.jwt_token;
  else
    window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self');

  const [firstName, setFirstName] = useState(userDetails.first_name);
  const [lastName, setLastName] = useState(userDetails.last_name);
  const [instititionName, setInstitutionName] = useState(userDetails.institution_name);
  const [orcid,setOrcid] = useState(userDetails.orcid);
  const [pronoun, setPronoun] = useState(userDetails.pronoun);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logout, setLogout] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  async function editAccount() 
  {
    if (
      firstName === "" ||
      lastName === "" ||
      instititionName === "" ||
      pronoun === ""
    ) {
      setPopupTitle("Field(s) Left Blank");
      setPopupText("Please do not Leave a field Blank");
      setOpen(true);
      setSuccess(false);
      return;
    }
    let item = {
      first_name: firstName,
      last_name: lastName,
      pronoun,
      institution_name: instititionName,
      orcid: orcid,
    };
    // console.log(item);
    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/edit-account`, {
      method: "POST",
      body: JSON.stringify(item),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${user_JWT_token}`,
      },
    });
    const data = await result.json();
    
    console.log(data,"Edit account response");

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
          editAccount();
        }
      }
      else
      {
        userDetails.first_name = firstName;
        userDetails.last_name = lastName;
        userDetails.institution_name = instititionName;
        userDetails.pronoun = pronoun;
        userDetails.orcid = orcid;
        sessionStorage.setItem("details", JSON.stringify(userDetails));
        setPopupTitle("Success!");
        setPopupText("Details have been updated");
        setOpen(true);
        setSuccess(true);
      }
    }
  }

  return (
    <>
      <div className="container">
        <center>
          <div className="edittext">Edit Information</div>
          <div className="underline"></div>
        </center>
        <div
          className="inputs-container"
          style={{ marginBottom: "20px" }}
        ></div>
        <div className="inputs">
          <div className="input">
            <RiUser3Fill className="icons" />
            <input
              type="text"
              placeholder="Enter First Name*"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              // This field will be filled in Automatically value="test"
            />
          </div>
          <div className="input">
            <RiUser3Fill className="icons" />
            <input
              type="text"
              placeholder="Enter Last Name*"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              // This field will be filled in Automatically value="test"
            />
          </div>
          <div className="input">
            <FaSchool className="icons" />
            <input
              type="text"
              placeholder="Enter Institution Name*"
              value={instititionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              // This field will be filled in Automatically value="unimelb"
            />
          </div>
          <div className="input">
            <RiUser3Fill className="icons" />
            <div className="dropdown">
              <LiaTransgenderAltSolid className="icons" />
              <select
                value={pronoun}
                onChange={(e) => setPronoun(e.target.value)}
              >
                <option value="">Select your Pronouns*</option>
                <option value="he/him">he/him</option>
                <option value="she/her">she/her</option>
                <option value="they/them">they/them</option>
                <option value="other">other</option>
              </select>
            </div>
          </div>
          <div className="input">
            <IoMdFingerPrint className="icons" />
            <input
              type="text"
              placeholder="Enter Orcid*"
              value={orcid}
              onChange={(e) => setOrcid(e.target.value)}
              // This field will be filled in Automatically value="unimelb"
            />
          </div>
        </div>
        <div className="submit-container">
          <button
            className="submit"
            onClick={() => {
              editAccount();
            }}
          >
            Click to Edit The details
          </button>
        </div>
        {open ? (
          success ? (
            <PopupSingleButton
              title={popupTitle}
              text={popupText}
              button_text={"Close"}
              button_listener={() => 
              {
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
            to="/edit-email"
          >
            <button
              className="reroute"
            >
              Edit Email
            </button>
          </Link>
          <Link
            className="nav-link active"
            aria-current="page"
            to="/edit-credentials"
            style={{ paddingTop: "10px" }}
          >
            <button
              className="reroute"
            >
              Edit Password
            </button>
          </Link>
          <Link
            className="nav-link active"
            aria-current="page"
            to="/"
            style={{ paddingTop: "10px" }}
          >
            <button className="reroute">Back</button>
          </Link>
        </center>
      </div>
    </>
  );
};

export default EditAccount;
