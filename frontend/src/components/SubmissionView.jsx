// src/SubmissionPage.js

import React from 'react';
import "./Css/SubmissionPage.css";
import { useState, useEffect} from "react";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";
import Logout from "./Logout.js";

// Submission Page
const SubmissionPage = () => {

  // Table stylings
  const tableStyle = {
    margin: "20px auto",
    marginTop: "10px",
    borderCollapse: "separate",
    borderSpacing: "0",
    overflow: "hidden",
    width: "100%",
    borderRadius: "8px",
  };
  const cellStyle = {
    background: '#fff',
    boxShadow: '2px 4px 8px rgba(0,0,0,0.1)',
    //borderRadius: '8px',
    margin: '10px 0',
    padding: '10px',
    border: 'none',
    borderBottom: "1px solid #eeeeee",
  };

  const headerCellStyle = {
    ...cellStyle,
    background: '#f5f5f5',
    color: '#333',
    fontWeight: 'bold',
    boxShadow: "2px 4px 8px rgba(0,0,0,0.1)",
  };


  const search = window.location.search;
  const params = new URLSearchParams(search);

  const userDetails = JSON.parse(sessionStorage.getItem("details"));

  if(!userDetails)
    window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
  else if(!params.get('submission_id'))
    window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`,'_self')

  const [submission_id] = useState(params.get('submission_id'))
  const [route_source] = useState(params.get('route_source'))
  const [user_roles] = useState(userDetails.roles);
  const [user_JWT_token] = useState(userDetails.jwt_token);

  const [title, setTitle] = useState("Sample Submission");
  const [authors, setAuthors] = useState([]);
  const [abstract, setAbstract] = useState("This is a sample submission.");
  const [submissionType, setSubmissionType] = useState("Research Article");
  const [status, setStatus] = useState("Under Primary Review");
  const [conflictOfInterest, setConflictOfInterest] = useState("None");
  const [acknowledgements, setAcknowledgements] = useState("None");
  const [parentSubmissionId, setParentSubmissionId] = useState(null);
  
  // popup state
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");
  const [logout, setLogout] = useState(false);

  // Author states
  const [decision, setDecision] = useState("");
  const [commentsAuthorRead, setCommentsAuthorRead] = useState("None");
  // Editor states
  const [outcomeResult, setOutcome] = useState(1);
  const [outcomeResultShow, setOutcomeResultShow] = useState("Accept");
  const [commentsForAuthor, setCommentsForAuthor] = useState("");
  const [user, setUser] = useState("");

  const [reviews, setReviews] = useState([]);

  const handleOutcomeSelect = (e) => 
  {
    setOutcomeResultShow(e.target.value);

    if(e.target.value === "Accept")
      setOutcome(1);
    else if(e.target.value === "Revise")
      setOutcome(2);
    else if(e.target.value === "Reject")
      setOutcome(3);
    else if(e.target.value === "Desk Reject")
      setOutcome(5);
    else
      console.log("Invalid outcome selected");
  };

  const handleOutcomeComment = (e) =>
  {
    setCommentsForAuthor(e.target.value);
  }

  const checkFieldsEmpty =(e) =>
  {
    console.log("commentsForAuthor", commentsForAuthor, outcomeResult)
    if (commentsForAuthor === "" ||  !outcomeResult) 
    {
      setPopupTitle("Missing Mandatory Fields");
      setPopupText("Please fill out the comments to author(s) and the outcome decision fields before submitting.");
      setOpen(true);
      setSuccess(false);
      return true
    }
    else
      return false
  }

  const outcomes = ["Accept", "Reject", "Revise", "Desk Reject"];
  


  async function downloadManuscript() 
  {
    const access_token_response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/submission/get-submission-access/${submission_id}/false`,
    {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Authorization": `Bearer ${user_JWT_token}`,
      }
    });

    const access_token_json = await access_token_response.json();
    const access_token = access_token_json.access_token;

    const url = `http://${process.env.REACT_APP_API_HOST}:8080/submission/get-manuscript/${access_token}`;
    // Download the
    const response = await fetch(url);
    const file = await response.blob();

    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = "manuscript.pdf";
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);

  }

  async function downloadAllFIles() 
  {
    const access_token_response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/submission/get-submission-access/${submission_id}/false`,
    {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Authorization": `Bearer ${user_JWT_token}`,
      }
    });

    const access_token_json = await access_token_response.json();
    const access_token = access_token_json.access_token;

    const url = `http://${process.env.REACT_APP_API_HOST}:8080/submission/get-all-files/${access_token}`;
    // Download the
    const response = await fetch(url);
    const file = await response.blob();

    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = "submission_files.zip";
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);

  }

  const submitOutcome = async () => 
  {
    if (checkFieldsEmpty())
      return; 
    let item = {submissionId: submission_id, outcomeRecommendation: outcomeResult, commentsToAuthor: commentsForAuthor};

    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/editorial-decisions/update-outcome`, {
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
          setPopupTitle("Login expired");
          setPopupText("Please try to login again from the home");
          setOpen(true);
          setLogout(true);
          setSuccess(true);
      }
      else
      {
        setPopupTitle("Success!");
        setPopupText("Outcome has been published");
        setOpen(true);
        setSuccess(true);
      }
    }
  }

  useEffect(() => 
  {
    const InitialiseSubmissionData = async () =>
      { 
          let response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/submission/get-submission/${submission_id}`, 
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "Authorization": `Bearer ${user_JWT_token}`,
            }
          });
          
          response = await response.json();
          if (response.error) 
          {
            console.log(response.error);
            setPopupTitle("Error");
            setPopupText(response.error);
            setOpen(true);
            setSuccess(true);
          } 
          else 
          {
            if (response.message === "jwt expired") 
            {
              setPopupTitle("Login expired");
              setPopupText("Please try to login again from the home");
              setOpen(true);
              setLogout(true);
              setSuccess(true);
            } 
            else 
            {
              setTitle(response.submission_title);
              setAuthors(JSON.parse(response.authors));
              setAbstract(response.abstract);
              setAcknowledgements(response.acknowledgements);
              setConflictOfInterest(response.conflict_of_interest);
              setSubmissionType(response.submission_type);
              setStatus(response.status);
              setParentSubmissionId(response.parent_submission_id);
    
              if(!response.outcome_id)
                setDecision("Pending");
              else if (response.outcome_id === 1)
                setDecision("Accepted");
              else if (response.outcome_id === 2)
                setDecision("Revise and Resubmit");
              else if (response.outcome_id === 3)
                setDecision("Rejected");
              else if (response.outcome_id === 4)
                setDecision("Will Accept with Minor Revisions");
              else if (response.outcome_id === 5)
                setDecision("Desk Rejected");
              else
              setDecision("Invalid outcome set by Editor. Please contact SILA");
    
              if(response.comments_to_author)
                setCommentsAuthorRead(response.comments_to_author);
            }
          }
    };
    
    const InitialiseReviewData = async () =>
    { 
        let response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/editorial-decisions/get-all-reviews-of-submission/${submission_id}`, 
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Authorization": `Bearer ${user_JWT_token}`,
          }
        });
        
        response = await response.json();

        if (response.error) 
        {
          console.log(response.error);
        } 
        else 
        {
          if (response.message === "jwt expired") 
          {
            setPopupTitle("Login expired");
            setPopupText("Please try to login again from the home");
            setOpen(true);
            setLogout(true);
            setSuccess(true);
          } 
          else 
          {
            setReviews(response);
          }
        }
      
    };

    InitialiseSubmissionData(); 

    console.log(route_source);

    if (user_roles.includes(1)) 
    { 
      setUser("Editor");
      InitialiseReviewData();
    } 

    if(user_roles.includes(3))
      setUser("Author");

  },[submission_id,user_JWT_token,user_roles,route_source]);

  return (
        
    <div className="submission-container">
      {open ? (
          success ? (
            <PopupSingleButton
              title={popupTitle}
              text={popupText}
              button_text={"Close"}
              button_listener={() => {
                if (logout)
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

      <h5><strong>Title: {title}</strong></h5>
      <h5><strong>Abstract:</strong></h5> <p style={{ textAlign: 'justify' }}>{abstract}</p>
      <h5><strong>Submission type:</strong> {submissionType}</h5>
      {user === "Author" || user === "Editor" ? (
        <div> 
          <h5><strong>Authors:</strong></h5>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>First Name</th>
                <th style={headerCellStyle}>Last Name </th>
                <th style={headerCellStyle}>Academic Title</th>
                <th style={headerCellStyle}>OrCID</th>
                <th style={headerCellStyle}>Affiliation</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((row, index) => (
                <tr key={index}>
                  <td style={cellStyle}>{row.first_name}</td>
                  <td style={cellStyle}>{row.last_name}</td>
                  <td style={cellStyle}>{row.academic_title}</td>
                  <td style={cellStyle}><a href={`https://orcid.org/${row.orcid}`} target="_blank" rel="noreferrer">{row.orcid}</a></td>
                  <td style={cellStyle}>{row.affiliation}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h5><strong>Status: </strong>{status}</h5>
          <h5><strong>Conflict of Interest: </strong> {conflictOfInterest}</h5>
          <h5><strong>Acknowledgements:</strong> {acknowledgements}</h5>
        </div>
      ):
      <div></div>}
      
      <div style={{marginTop:"15px"}}>
      <div className="show-pdf-container">

        <button
          className="manuscript-button right-container"
          value="view"
          onClick={() => {
            window.open(`http://${process.env.REACT_APP_HOST}/pdf-viewer?submission_id=${submission_id}`, '_self');
          }}
        >
          View Manuscript
        </button>
       
        <button
          className="manuscript-button right-container"
          value="download"
          onClick={() => {
            downloadManuscript()
          }}
        >
          Download PDF
        </button>
        <button
          className="manuscript-button right-container"
          onClick={() => {
            // Download all files
            downloadAllFIles()
          }}>
          Download all files
        </button>
      </div>
      <div className="show-pdf-container">

      {user === "Author" ?  (
        <div style={{ width: '80%',margin: '0 auto'}}>
            <div className='review-container' style={{ width: '100%',margin: '0 auto'}}>
            <h3><strong>Decision:</strong></h3><p>{decision}</p>
            <h3><strong>Comments:</strong></h3><p style={{ textAlign: 'justify' }}>{commentsAuthorRead}</p>
              {decision === "Will Accept with Minor Revisions" || decision=== "Revise and Resubmit"?
              (<button
              className="review-button right-container"
              value="resubmit"
              onClick={() => 
              {
                window.open(`http://${process.env.REACT_APP_HOST}/submission?parent_submission_id=${submission_id}`, '_self');
              }}
              >
              Make a resubmission
              </button>)
            :null}
            </div>         
        </div>

      ): 
        user === "Editor" ? 
          (
              <div className='review-container'>
                <h3>Reviews</h3>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{...headerCellStyle, width: '5%'}}>No.</th>
                      <th style={{...headerCellStyle, width: '10%'}}>Reviewer</th>
                      <th style={{...headerCellStyle, width: '10%'}}>Recommended Outcome</th>
                      <th style={headerCellStyle}>Comments to the editor</th>
                      <th style={headerCellStyle}>Comments to the author</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((row, index) => (
                      <tr key={index}>
                        <td style={cellStyle}>{index + 1}</td>
                        <td style={cellStyle}>{row.reviewer_name}</td>
                        <td style={cellStyle}>{row.outcome_name}</td>
                        <td style={cellStyle}>{row.review_comments_editor}</td>
                        <td style={cellStyle}>{row.review_comments_author}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          ):null}
          
        </div>
        
        <div className="show-pdf-container">
        {decision === "Pending" && user === "Editor"?      
          (
            <div className='review-container'>
            <h4>Comments</h4>
            <TextField
              id="reviewer-comments"
              label="Comments to the Author(s)"
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              onChange={handleOutcomeComment}
            />
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="outcome-select-label">Outcome</InputLabel>
              <Select
                labelId="outcome-select-label"
                id="outcome-select-select"
                label="Outcome"
                value={outcomeResultShow}
                onChange={handleOutcomeSelect}
              >
                {outcomes.map((outcome) => (
                  <MenuItem
                    key={outcome}
                    value={outcome}
                    style={{
                      fontWeight: outcome === outcomeResult
                    }}
                  >
                    {outcome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <button
              className="submit-coutcome"
              onClick={() => 
              {
                submitOutcome();
              }}
            >
              Submit Outcome
            </button> 
          </div>)
        : user === "Editor"?
          <div className='review-container'>
            <h3><strong>Decision:</strong></h3><p>{decision}</p>
            <h3><strong>Comments:</strong></h3><p style={{ textAlign: 'justify' }}>{commentsAuthorRead}</p>
          </div>
        :null  
      };
      
      </div>
      </div>
      {route_source!=null?
          <div style={{padding: '20px'}}>
            <center>
            {
            parentSubmissionId?
            <button 
            style={{marginLeft:"10px",marginRight:"10px",}}
            className='back-button'
            onClick={() => 
              {
                window.open(`http://${process.env.REACT_APP_HOST}/Submission-paper?submission_id=${parentSubmissionId}`,"_blank");
              }}
            >View Previous Version</button>
            : null
            }
            <button 
            style={{marginLeft:"10px",marginRight:"10px"}}
            className='back-button'
            onClick={() => 
              {
                window.open(`http://${process.env.REACT_APP_HOST}/${route_source}`,"_self");
              }}
            >Back</button>
        </center>
      </div>
      :null}
    </div>
  )};


export default SubmissionPage;
