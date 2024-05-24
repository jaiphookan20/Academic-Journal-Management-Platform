import React, { useState } from 'react'
import { RiLockPasswordFill } from "react-icons/ri";
import { FaRegUserCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { PopupSingleButton } from './subComponents/PopupSingleButton.js';
import Cookies from 'js-cookie';

const Login = () => {

  //Elements of single button popup
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")

  async function login()
  {
    let item = {username,password} ;
    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/signin`,{
                method:"POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body:JSON.stringify(item)
        });
        result = await result.json();

        if (result.error === "Username not found")
        {
          setPopupTitle("Invalid username");
          setPopupText("Please Enter a Valid Username");
          setOpen(true);
          setSuccess(false);
        }
        else if (result.error === "Wrong password")
        {
          setPopupTitle("Incorrect password");
          setPopupText(`Please Enter The Correct Password for the Username: ${username}`);
          setOpen(true);
          setSuccess(false);
        }
        if (!result.error)
        {
          setPopupTitle("WELCOME TO SILA!");
          setPopupText("You have logged in successfully!");
          setOpen(true);
          setSuccess(true);

          sessionStorage.setItem("details", JSON.stringify(result));
          Cookies.set('refresh_token', result.refresh_token,{ expires: 7 });
          Cookies.set('client_id', result.client_id,{ expires: 7 });
        }
  }
  return (
    <div className="container">

     
      {/*Added for popup*/ 
        open ? 
            (success? 
                <PopupSingleButton title={popupTitle} text={popupText} button_text={"Close"}  button_listener={()=> {window.location.href = "/";}} /> 
                  : <PopupSingleButton title={popupTitle} text={popupText} button_text={"Close"}  button_listener={()=> {setOpen(false);}} />)
              : null
      }

      <center>
        <div className="header">
          <div className="text">Login</div>
          <div className="underline"></div>
        </div>
      </center>
      <div className="inputs-container" style={{ marginBottom: '20px' }}></div>
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
        <div className="inputs-container" style={{ marginBottom: '20px' }}></div>
        <center>
        <div className="submit gray" style={{ backgroundColor: 'black', color: 'white' }}  onClick={() => {
            login();
        }}>
  Login
</div>
        </center>
        
        <div className="left-container">
      <div  className="forgot-btn" onClick={() => console.log('Forgot password clicked')}>
      <Link to="/forgot-password" className="forgot-btn">
        Forgot Password?
        </Link>
      </div >
      </div>
    </div>
  )
}

export default Login
