import React from 'react'
import { useState, useEffect } from "react";
import "./Css/Dashboard.css";
import { Link } from 'react-router-dom';
import { PopupTable } from './subComponents/PopUpTable';


const Authordashboard = () => 
{
  const tableStyle = {
    margin: "40px auto",
    borderCollapse: "separate",
    borderSpacing: "0",
    overflow: "hidden",
    width: "100%",
    maxWidth: '100%',
    borderRadius: "8px",
  };
  const cellStyle = {
    background: "#fff",
    boxShadow: "2px 4px 8px rgba(0,0,0,0.1)",
    margin: "10px 0",
    padding: "10px",
    border: "0.2px #ccc",
    borderBottom: "1px solid #eeeeee",
  };

  const headerCellStyle = {
    ...cellStyle,
    background: "#f5f5f5",
    color: "#333",
    fontWeight: "bold",
    boxShadow: "2px 4px 8px rgba(0,0,0,0.1)",
  };

  /* eslint-disable */
  const [latestSubmissions, setLatestSubmissions] = useState([]);
  const details = JSON.parse(sessionStorage.getItem("details"));
  
  let user_JWT_token = null;
  if(details)
    user_JWT_token = details.jwt_token;

  
  const [tablePopUpOpen, setTablePopUpOpen] = useState(false);
  const [tablePopUpContent, setTablePopUpContent] = useState("");
  const [tablePopUpTitle, setTablePopUpTitle] = useState("");

  // const [mockData, setMockData] = useState([]); // This is the mock data for the table
  
  async function showPrevious(original_submission_id)
  {
    try 
    {
      console.log("Original submission id",original_submission_id)
      const response = await fetch(
        `http://${process.env.REACT_APP_API_HOST}:8080/submission/get-all-linked-submissions/${original_submission_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${user_JWT_token}`,
          },
        }

      );
      if (!response.ok) 
      {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setTablePopUpOpen(true);
      setTablePopUpTitle("Submission Version History");
      setTablePopUpContent(data);
    } 
    catch (error) 
    {
      console.error('Error fetching data:', error);
    }

  };



  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_API_HOST}:8080/submission/get-all-latest-submissions`,{
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${user_JWT_token}`,
            },
          }

        );
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        setLatestSubmissions(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if(!user_JWT_token)
    {
      window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
    }
    else if(!details.roles.includes(3))
    {
        window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`,'_self')
    }
    else
    {
      fetchData(); // Call the fetchData function when the component mounts
    }

  }, [user_JWT_token]);

  console.log(latestSubmissions);
  let counter = 1;

  return (
    
    <>
    <div className='dashboard-container'>
      <center><h1>Welcome to your Author Dashboard!</h1>
      <h4>You can track all the submissions!</h4>
      </center>
      {/* Add a condition here if no submssion exisst for the author do not display the table */}
      {/* This will be automatically fetched from the databse */}
      
      {tablePopUpOpen ? (
        <PopupTable
          title={tablePopUpTitle}
          content={tablePopUpContent}
          button_text={"Close"}
          button_listener={() => {
            setTablePopUpOpen(false);
          }}
        />
          ) : null}

      <table style={tableStyle}>
        <thead>
        <tr>
          <th style={{ ...headerCellStyle, width: '2%' }}>No</th>
          <th style={{ ...headerCellStyle, width: '20%' }}>Title</th>
          <th style={{ ...headerCellStyle, width: '5%' }}>Submission ID</th>
          <th style={{ ...headerCellStyle, width: '10%' }}>Submission Date and time</th>
          <th style={{ ...headerCellStyle, width: '5%' }}>Submission Type</th>
          <th style={{ ...headerCellStyle, width: '20%' }}>Abstract</th>
          <th style={{ ...headerCellStyle, width: '10%' }}></th>
          <th style={{ ...headerCellStyle, width: '10%' }}></th> 
</tr>
        </thead>
        <tbody>
        {latestSubmissions.map((submission, index) => (
          <tr key={index} style={{ background: "transparent" }}>
            <td style={cellStyle}>{counter++}</td>
            <td style={cellStyle}>{submission.submission_title}</td>
            <td style={cellStyle}>{submission.submission_id}</td>
            <td style={cellStyle}>{new Date(submission.submission_time).toLocaleString()}</td>
            <td style={cellStyle}>{submission.submission_type}</td>
            <td style={cellStyle}>{submission.abstract.length > 100 ?
            `${submission.abstract.substring(0, 100)}...` :
            submission.abstract
            } </td>
<td style={cellStyle}>
  {submission.original_submission_id !== submission.latest_submission_id && (<button className='nav-link login' onClick={() => {showPrevious(submission.original_submission_id)} }>View Older Versions</button>)}
  </td>
<td style={cellStyle}><center><button className='nav-link login' onClick={() => {
            window.open(`http://${process.env.REACT_APP_HOST}/Submission-paper?submission_id=${submission.submission_id}&route_source=author-dashboard`, '_self');
          }}>Click To View</button></center></td>
          </tr>
        ))}
        </tbody>
      </table>
      <center>
      <div className="new-submit-author">
      <Link to="/submission" className="new-submit-author-btn"> 
            Click to make a new Submission!
        </Link>
        </div>
    </center>
    </div>
    </>
  )
}

export default Authordashboard
