import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import SiLA_logo from "../assets/SiLA_logo.png";
import "./Css/Navbar.css";
import Logout from "./Logout";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const details = JSON.parse(sessionStorage.getItem("details"));
  let usersName = ""
  let userRoles = ""
  if (details){
    usersName = details.first_name
    userRoles = details.roles;
  }
  
  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">
              <img src={SiLA_logo} alt="SI-Koala Logo" height="80" />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              onClick={toggleNavbar}
              aria-label="Toggle navigation"
              style={{
                border: "none",
                background: "none",
                boxShadow: "none",
                outline: "none",
              }}
            >
              {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
            <div
              className={`${isOpen ? "show" : ""} collapse navbar-collapse`}
              id="navbarNavAltMarkup"
            >
              <div className="navbar-nav ms-auto">
                <Link className="nav-button" aria-current="page" to="/">
                  Home
                </Link>
                {(details && userRoles.includes(3)) ? (
                  <Link className="nav-button" aria-current="page" to="/author-dashboard">
                    My Submissions
                  </Link>
                ) : null}

                  {(details && userRoles.includes(3)) ? (
                  <Link className="nav-button" aria-current="page" to="/submission">
                    Create Submission
                  </Link>
                ) : null}

                {/* Below are the Links for Editors Add if new here*/}
                {(details && userRoles.includes(1)) ? (
                  <Link className="nav-button" aria-current="page" to="/editor-in-progress-submissions">
                    In-Progress Reviews
                  </Link>
                ) : null}

                {(details && userRoles.includes(1)) ? (
                  <Link className="nav-button" aria-current="page" to="/editor-review-completed-submissions">
                    Completed Reviews
                  </Link>
                ) : null}

                {(details && (userRoles.includes(1) || userRoles.includes(2))) ? (
                  <Link className="nav-button" aria-current="page" to="/EditorSignUp" >
                    Internal Signups
                  </Link>
                ) : null}

                {(details && (userRoles.includes(1) || userRoles.includes(2))) ? (
                  <Link className="nav-button" aria-current="page" to="/assign-roles" >
                    Assign Roles
                  </Link>
                ) : null}
                
                {(details && userRoles.includes(1)) ? (
                  <Link className="nav-button" aria-current="page" to="/editor-submission-board" >
                    Assign Reviewers
                  </Link>
                ) : null}

                {/* Below are the Links for Editorial Assistants Add if new here*/}
                {(details && userRoles.includes(2)) ? (
                  <Link className="nav-button" aria-current="page" to="/editorial-assistant-dashboard" >
                    Assign Editors
                  </Link>
                ) : null}


                {/* Below are the Links for Reviewers Add if new here*/}
                {(details && userRoles.includes(4)) ? (
                  <Link className="nav-button" aria-current="page" to="/review-request" >
                    Review Requests
                  </Link>
                ) : null}

                {(details && userRoles.includes(4)) ? (
                  <Link className="nav-button" aria-current="page" to="/reviewer-dashboard" >
                    In-progress Reviews
                  </Link>
                ) : null} 

                {(details && userRoles.includes(4)) ? (
                  <Link className="nav-button" aria-current="page" to="/reviewer-completed" >
                    Completed Reviews
                  </Link>
                ) : null} 

                {/* <Link
                  className="nav-link active"
                  aria-current="page"
                  to="/paths"
                >
                  Dev-Paths
                </Link> */}
              </div>
              <div className="navbar-nav ms-auto">
              {!details ? 
                <>
                <Link
                  className="nav-link login"
                  aria-current="page"
                  to="/signup"
                >
                  Signup!
                </Link>
                <Link
                  className="nav-link login"
                  aria-current="page"
                  to="/Login"
                >
                  Login
                </Link>
                </> :
                <>
                <h3 className="nav-link welcome">
                 Welcome, {usersName}! 
                </h3>
                <Link
                 className="nav-link login"
                 to="/profile"
                 >
                  My profile
                </Link>
                <Link
                 className="nav-link login"
                 to="/"
                 onClick={() => {
                  Logout();
                 }}
                >
                 Log Out
                </Link>
                </>}
              </div>
            </div>
          </div>
        </nav>
      }
    </>
  );
};

export default Navbar;
