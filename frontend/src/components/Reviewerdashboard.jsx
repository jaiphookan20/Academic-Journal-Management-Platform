import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logout from "./Logout.js";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";

const ReviewerDashboard = () => 
{
  const navigate = useNavigate();
  let userDetails = JSON.parse(sessionStorage.getItem("details"));
  
  let user_JWT_token = null;
  
  if(userDetails)
    user_JWT_token = userDetails.jwt_token;
  
  if(!user_JWT_token)
  {
    window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
  }
  else if(!userDetails.roles.includes(4))
  {
    window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`,'_self')
  }

  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [openAbstract, setOpenAbstract] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logout, setLogout] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  // For filtering
  useEffect(() => {
    if (searchTerm === "") 
    {
      const new_filtered_array = []
      articles.forEach((element,index) => 
      {
        element.articles_array_index = index;
        new_filtered_array.push(element);
      });
      setFilteredArticles(new_filtered_array);
    } 
    else 
    {
      const new_filtered_array = []
      articles.forEach((element,index) => 
      {
        if(element.submission_title.toLowerCase().includes(searchTerm.toLowerCase()))
        {
          element.articles_array_index = index;
          new_filtered_array.push(element);
        }
      });
      setFilteredArticles(new_filtered_array);
    }
  }, [searchTerm, articles]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const viewAbstract = (index) =>
  {
    setPopupTitle("Abstract of submission: ",articles[index].submission_id);
    setPopupText(articles[index].submission_abstract);
    setOpenAbstract(true);
  }

  // For fetching all accepted requests
  useEffect(() =>
  {
      const fetchAcceptedReview = async () => {
      let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/get-accepted-submissions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user_JWT_token}`,
        },
      });
  
      result = await result.json();
      console.log(result, "Get accepted review response");
  
      if (result.error) 
        {
        setPopupTitle("Error");
        setPopupText(result.error);
        setOpen(true);
        setSuccess(false);
      } 
      else 
      {
        if (result.message === "jwt expired") 
        {
          setPopupTitle("Login expired");
          setPopupText("Please try to login again from the home");
          setOpen(true);
          setLogout(true);
          setSuccess(true);
        } 
        else 
        {
          setArticles(result);
        }
      }
    }
    fetchAcceptedReview();
  },[user_JWT_token]);

  const handleSubmitReviewManually = (e, article) => {
    e.preventDefault();
    console.log('Navigating with state:', { targetDate: article.target_date });
    navigate('/review-form', { state: { submissionTitle: article.submission_title, targetDate: article.target_date, submissionId: article.submission_id } });
  };

  async function downloadManuscript(article) 
  {
    const access_token_response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/submission/get-submission-access/${article.submission_id}/false`,
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

  async function downloadAllFIles(article) 
  {
    const access_token_response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/submission/get-submission-access/${article.submission_id}/false`,
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

  const dashboardContainerStyle = {
    width: "100%",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif",
    background: "#f3e7e7",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
  };

  const searchBoxStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  };

  const inputStyle = {
    padding: "10px",
    margin: "20px 0",
    width: "30%",
    border: "1px solid #ddd",
    borderRadius: "20px",
    fontSize: "16px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "border-color 0.3s, box-shadow 0.3s",
  };

  const tableStyle = {
    margin: "30px auto",
    borderCollapse: "separate",
    borderSpacing: "0",
    overflow: "hidden",
    width: "90%",
    borderRadius: "20px",
    background: "#f5e6e6",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  };

  const cellStyle = {
    padding: "10px",
    border: "none",
    textAlign: "left",
    background: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  };

  const headerCellStyle = {
    ...cellStyle,
    background: "#f5f5f5",
    color: "#333",
    fontWeight: "bold",
    padding: "12px",
  };

  const reviewButtonStyle = {
    padding: "5px 5px",
    border: "2px solid",
    backgroundColor: "transparent",
    borderRadius:'0px',
    color: "#963737",
    cursor: "pointer",
    fontSize: "14px",
    transition: "border 0.2s ease-in-out",
  };

  const reviewButtonHoverStyle = {
    backgroundColor: "#f7f7f7",
    color: "#963737",
    border: "none",
    borderBottom: "4px solid #963737",
  };

  return (
    <div style={dashboardContainerStyle}>
      <center>
        <h1>Welcome to your Reviewer Dashboard!</h1>
        <h4>You can view the status of the Submissions assigned to you here.</h4>
        <div style={searchBoxStyle}>
          <input
            type="text"
            style={inputStyle}
            placeholder="Search articles..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...headerCellStyle, width: "5%" }}>Submission ID</th>
                <th style={{ ...headerCellStyle, width: "40%" }}>Title</th>
                <th style={{ ...headerCellStyle, width: "10%" }}>Target Date</th>
                <th style={{ ...headerCellStyle, width: "15%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((row, index) => (
                <tr key={index} style={{ background: "transparent" }}>
                  <td style={cellStyle}>{row.submission_id}</td>
                  <td style={cellStyle}>{row.submission_title} 
                    <div style={{ display: "flex", flexDirection: "row"}}>
                      <button
                        style={{
                          backgroundColor: "transparent",
                          color: "#0077b6",
                          cursor: "pointer",
                          fontSize: "14px",
                          textDecoration: "none",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.textDecoration = "underline";
                          e.currentTarget.style.color = "#023e8a";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.textDecoration = "none";
                          e.currentTarget.style.color = "#0077b6";
                        }}
                        onClick={() => viewAbstract(row.articles_array_index)}>
                        [View Abstract]
                      </button>
                      <button
                        style={{
                          backgroundColor: "transparent",
                          color: "#0077b6",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          textDecoration: "none",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.textDecoration = "underline";
                          e.currentTarget.style.color = "#023e8a";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.textDecoration = "none";
                          e.currentTarget.style.color = "#0077b6";
                        }}
                        onClick={() => {
                          console.log("Running here",row.submission_id,process.env.REACT_APP_HOST);
                          window.open(`http://${process.env.REACT_APP_HOST}/pdf-viewer?submission_id=${row.submission_id}`, '_blank');
                        }}
                      >
                        [View Manuscript]
                      </button>
                      <button
                        style={{
                          backgroundColor: "transparent",
                          color: "#0077b6",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          textDecoration: "none",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.textDecoration = "underline";
                          e.currentTarget.style.color = "#023e8a";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.textDecoration = "none";
                          e.currentTarget.style.color = "#0077b6";
                        }}
                        onClick={() => {
                          downloadManuscript(row)
                        }}
                      >
                        [Download Manuscript]
                      </button>
                    </div>
                  </td>
                  <td style={cellStyle}>{row.target_date}</td>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", flexDirection: "column", margin:"20px" }}>
                      <button
                        style={reviewButtonStyle}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = reviewButtonHoverStyle.backgroundColor;
                          e.currentTarget.style.color = reviewButtonHoverStyle.color;
                          e.currentTarget.style.border = reviewButtonHoverStyle.border;
                          e.currentTarget.style.borderBottom = reviewButtonHoverStyle.borderBottom;
                          }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = reviewButtonStyle.backgroundColor;
                          e.currentTarget.style.color = reviewButtonStyle.color;
                          e.currentTarget.style.border = reviewButtonStyle.border;
                        }}
                        onClick={() => {
                          console.log("Running here",row.submission_id,process.env.REACT_APP_HOST);
                          window.open(`http://${process.env.REACT_APP_HOST}/pdf-reviewer?submission_id=${row.submission_id}`, '_blank');
                        }}
                      >
                        Add Comments to Manuscript
                      </button>
                      <button
                        style={{ ...reviewButtonStyle, marginTop: "10px" }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = reviewButtonHoverStyle.backgroundColor;
                          e.currentTarget.style.color = reviewButtonHoverStyle.color;
                          e.currentTarget.style.border = reviewButtonHoverStyle.border;
                          e.currentTarget.style.borderBottom = reviewButtonHoverStyle.borderBottom;
                          }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = reviewButtonStyle.backgroundColor;
                          e.currentTarget.style.color = reviewButtonStyle.color;
                          e.currentTarget.style.border = reviewButtonStyle.border;
                        }}
                        onClick={(e) => handleSubmitReviewManually(e, row)}
                      >
                        Submit Review
                      </button>
                      <button
                        style={{ ...reviewButtonStyle, marginTop: "10px" }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = reviewButtonHoverStyle.backgroundColor;
                          e.currentTarget.style.color = reviewButtonHoverStyle.color;
                          e.currentTarget.style.border = reviewButtonHoverStyle.border;
                          e.currentTarget.style.borderBottom = reviewButtonHoverStyle.borderBottom;
                          }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = reviewButtonStyle.backgroundColor;
                          e.currentTarget.style.color = reviewButtonStyle.color;
                          e.currentTarget.style.border = reviewButtonStyle.border;
                        }}
                        onClick={() => { downloadAllFIles(row) }}
                      >
                        Download Files
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {open ?
            (success ? (
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
              />)
              :
              (<PopupSingleButton
                title={popupTitle}
                text={popupText}
                button_text={"Close"}
                button_listener={() => { setOpen(false); }}
              />))
            : null}
        {openAbstract ?
            (
              <PopupSingleButton
                title={popupTitle}
                text={popupText}
                button_text={"Close"}
                style = {{width:'80%'}}
                button_listener={() => { setOpenAbstract(false); }}
              />)
            : null}
      </center>
    </div>
  );
};

export default ReviewerDashboard;
