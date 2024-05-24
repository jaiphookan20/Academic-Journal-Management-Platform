import React, {useEffect} from 'react'
import './Css/Home.css';
import { FaRegCopyright } from "react-icons/fa";
import Altaanz_logo from "../assets/Altnaaz.png";
import SiLA_logo from "../assets/SiLA_logo.png";
import Cookies from 'js-cookie';
import RefreshToken from './RefreshToken';
import Logout from "./Logout.js";

const Home = () => 
{
  // Uses the refresh token to login again if the session storage is empty, and the cookies with refresh token are still available.
  const LoginRefresh = async() =>
  {
    let user_JWT_token = null;
    const userDetails = JSON.parse(sessionStorage.getItem("details"));
    if(userDetails)
      user_JWT_token = userDetails.jwt_token;

    const refresh_token = Cookies.get("refresh_token");
    const client_id = Cookies.get("client_id");

    // Checks if the cookies are available and the session storage is not available 
    if(refresh_token && client_id && !user_JWT_token)
    {  
      const login_refresh_status = await RefreshToken();

      // If login is success, reload page
      if(login_refresh_status)
        window.location.reload();
      // If login is failure, remove all stored info and cookies.
      else
        Logout();
    }
  }

  useEffect(() => {
    LoginRefresh();
  }); 

  return (
    <> 
    <div className="home-container">
        <p className="sliding-text text">WELCOME TO SiLA WEB!</p>  
        <p className="about-sila">
        Studies in Language Assessment (SiLA) is a peer-reviewed international journal in the field of language testing and assessment. 
        It is published on an open access basis by the sponsoring organisation, the Association for Language Testing and Assessment of 
        Australia and New Zealand (ALTAANZ). The Committee of ALTAANZ has general oversight of the journal in terms of publication policy 
        and financial matters. However, all editorial decisions are in the hands of two co-editors, who are elected by the membership of 
        ALTAANZ for concurrent two-year terms. The co-editors periodically seek advice on policy matters from an editorial board comprising 
        leading members of ALTAANZ in Australia and New Zealand as well as top researchers in the field elsewhere in the world. 
        Membership of the board is reviewed annually and new members are added by invitation of the co-editors.
      </p>
    </div>
    
    <div className="content-above-footer">
      <center>
      <img src={Altaanz_logo} alt="Altaanz_logo" height="80" style={{paddingRight: ' 20px'}}/>
      <img src={SiLA_logo} alt="Altaanz_logo" height="80" />
        </center>
      </div>
    <div className="footer">
        <p><FaRegCopyright /> SILA 2024</p>
      </div>
    </>
  )
}

export default Home
