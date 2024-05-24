import React from "react";
import "./Css/LoginSIgnup.css";
import { FaRegUserCircle } from "react-icons/fa";
import { RiUser3Fill } from "react-icons/ri";
import { HiOutlineMail } from "react-icons/hi";
import { LiaTransgenderAltSolid } from "react-icons/lia";
import { IoMdFingerPrint } from "react-icons/io";
import { FaSchool } from "react-icons/fa6";
import { useState } from "react";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";

//import Axios from 'axios';

const EditorSignUp = () => {
  const userDetails = JSON.parse(sessionStorage.getItem("details"));
  
  let user_JWT_token = null;
  if(userDetails)
      user_JWT_token = userDetails.jwt_token;
      
  else
      window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
  
  const user_roles = userDetails.roles;

  if (!user_roles.includes(1) && !user_roles.includes(2)) {
    window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`, '_self');
    }


  const [action, setAction] = useState("Create new Internal account");
  const [role, setRole] = useState("Reviewer");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [pronoun, setPronoun] = useState("");
  const [username, setUsername] = useState("");
  const [orcid,setorcid] = useState("");
  const [institution_name, setInstitution_name] = useState("");

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  async function signup() {
      let item = {
        username,
        first_name,
        last_name,
        email,
        institution_name,
        pronoun,
        role,
        orcid,
      };
      console.log(item);

      
      if (checkFieldsEmpty()){
        return
      }
      let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/signup/${role}`, {
        method: "POST",
        body: JSON.stringify(item),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Authorization": `Bearer ${user_JWT_token}`,
        },
      });
      const data = await result.json();
      //console.log("Response from backend:", data);
      if (data.message === "jwt expired") {;
        setPopupTitle("Error");
        setPopupText("Login Expired. Please login again.");
        setOpen(true);
        setSuccess(false);
        return;
      }
      if (data.error){
        setPopupTitle("Error");
        setPopupText(data.error);
        setOpen(true);
        setSuccess(false);
      }
      else{
        setPopupTitle("Account successfully created!");
        setPopupText("The user of this account will recieve an email to validate their account.");
        setOpen(true);
        setSuccess(true);
        setFirst_name("");
        setLast_name("");
        setEmail("");
        setPronoun("");
        setUsername("");
        setInstitution_name("");
        setorcid("");
        setRole("Reviewer");
      }  
  }

  const checkFieldsEmpty =(e) =>{

    if (first_name === "" || last_name === "" || email ==="" || username ==="" ||  institution_name==="" || role ==="" ) {
      setPopupTitle("Missing Mandatory Fields");
      setPopupText("You are missing one of the mandatory fields. They are indicated with a *");
      setOpen(true);
      setSuccess(false);
      return true
    }
    if(first_name !== "" && last_name !== "" && email !=="" && username !=="" && institution_name !==" " && role !==""){
    return false
    }
    
  }

  const handlePronounSelect = (e) => {
    setPronoun(e.target.value);
    e.target.classList.add("dark-text");
  };
  const handleRoleSelect = (e) => {
    setRole(e.target.value);
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
      {open ? (
          success ? (
            <PopupSingleButton
              title={popupTitle}
              text={popupText}
              button_text={"Close"}
              button_listener={() => {
                setOpen(false);
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
      <div className="inputs">

        <div className="inputs-container">
            {user_roles.includes(2) || user_roles.includes(1)? (
              <div className="dropdown" >
              <select className="dropdown" value={role} onChange={handleRoleSelect}>
                <option value="">Select role*</option>
                <option value="Author">Author</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Editor">Editor</option>
                <option value="Editorial Assistant">Editorial Assistant</option>
              </select>
            </div>
            ) : (
                <div ></div>
            )}
        </div>
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
                  <option value="">Select Pronouns*</option>
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
                <FaSchool className="icons" />
                <input
                  type="text"
                  placeholder="Enter Institution*"
                  value={institution_name}
                  onChange={(e) => setInstitution_name(e.target.value)}
                />
              </div>
          </div>
        </div>
      </div>
      <div className="input" style={{ marginTop: "20px" }}>
              <IoMdFingerPrint className="icons" />
              <input
                type="text"
                placeholder="Enter Orcid*"
                value={orcid}
                onChange={(e) => setorcid(e.target.value)}
              />
            </div>
      <div className="submit-container">
      
        <button
          className="submit"
          onClick={() => {
            setAction("Create new account");
            signup();
          }}
        >
          Create account
        </button>
      </div>
    </div>
  );
};

export default EditorSignUp;
