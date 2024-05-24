import React from 'react'
import { useState, useEffect } from "react";

const EditorInProgressDashboardSubmissions = () => {
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
    
      const [inProgressSubmissions, setInProgressSubmissions] = useState([]);
      const details = JSON.parse(sessionStorage.getItem("details"));
      let user_JWT_token = null;
      if(details)
        user_JWT_token = details.jwt_token;

      if(!user_JWT_token)
      {
        window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
      }
      else if(!details.roles.includes(1))
      {
          window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`,'_self')
      }

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch(
              `http://${process.env.REACT_APP_API_HOST}:8080/editorial-decisions/get-all-current-submissions`,{
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
            setInProgressSubmissions(data);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };

        fetchData(); // Call the fetchData function when the component mounts
        
      }, [user_JWT_token]);

      
      //console.log(inProgressSubmissions);

      const extractAuthorNames = (authorsString) => {
        // Check if authorsString is a JSON array or a plain string
        let authorsArray;
        try {
          authorsArray = JSON.parse(authorsString);
        } catch (error) {
          // Parsing failed, assume it's a plain string with comma-separated names
          authorsArray = authorsString.split(", ");
        }
        // Map over the authorsArray and extract first_name and last_name
        return authorsArray.map(author => `${author.first_name} ${author.last_name}, `);
      };   
      // Iterate through data and extract author names
      const authorNamesArray = inProgressSubmissions.map(item => extractAuthorNames(item.authors));
      authorNamesArray.forEach(element => {
        element[element.length-1] = element[element.length-1].substring(0,element[element.length-1].length-2)
      });

      let counter = 1;
  return (
    <>
    <div className='dashboard-container'>
        <center><h1>View the In-Progress Reviews here!</h1></center>
        <table style={tableStyle}>
        <thead>
        <tr>
          <th style={{ ...headerCellStyle, width: '2%' }}>No</th>
          <th style={{ ...headerCellStyle, width: '20%' }}>Title</th>
          <th style={{ ...headerCellStyle, width: '5%' }}>Submitted By</th>
          <th style={{ ...headerCellStyle, width: '10%' }}>Submission ID</th>
          <th style={{ ...headerCellStyle, width: '5%' }}>Submission Type</th>
          <th style={{ ...headerCellStyle, width: '5%' }}>Submission Status</th>
          
          <th style={{ ...headerCellStyle, width: '10%' }}></th> 
</tr>
        </thead>
        <tbody>
  {inProgressSubmissions.map((submission, index) => (
    <tr key={index} style={{ background: "transparent" }}>
      <td style={cellStyle}>{counter++}</td>
      <td style={cellStyle}>{submission.submission_title}</td>
      <td style={cellStyle}>{authorNamesArray[counter-2]}</td>
      <td style={cellStyle}>{submission.submission_id}</td>
      <td style={cellStyle}>{submission.submission_type}</td>
      <td style={cellStyle}>{submission.status}</td>
      <td style={cellStyle}><center><button className='nav-link login' onClick={() => {
            window.open(`http://${process.env.REACT_APP_HOST}/Submission-paper?submission_id=${submission.submission_id}&route_source=editor-in-progress-submissions`, '_self');
          }}>Click To View</button></center></td>
    </tr>
  ))}
</tbody>
        </table>
    </div>
    </>
  )
}

export default EditorInProgressDashboardSubmissions
