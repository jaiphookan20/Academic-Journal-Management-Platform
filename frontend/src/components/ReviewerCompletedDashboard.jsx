import React, { useState, useEffect } from "react";
import Logout from "./Logout.js";
import { PopupSingleButton } from "./subComponents/PopupSingleButtonReview.js";

const ReviewerCompletedDashboard = () => {

  let userDetails = JSON.parse(sessionStorage.getItem("details"));
  let user_JWT_token = ""
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
  const [success, setSuccess] = useState(false);
  const [logout, setLogout] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  const [reviewDetails, setReviewDetails] = useState({
    outcome_name: "",
    revision_review: "",
    review_comments_editor: "",
    review_comments_author: "",
  });
  const [showReviewPopup, setShowReviewPopup] = useState(false);

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

  //get the completed reviews
  useEffect(() => {
    const fetchReviewRequest = async () => {
      let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/get-completed-reviews`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user_JWT_token}`,
        },
      });

      result = await result.json();
      console.log(result, "Get completed review response");

      if (result.error) {
        setPopupTitle("Error");
        setPopupText(result.error);
        setOpen(true);
        setSuccess(false);
      } else {
        if (result.message === "jwt expired") {
          setPopupTitle("Login expired");
          setPopupText("Please try to login again from the home");
          setOpen(true);
          setLogout(true);
          setSuccess(true);
        } else {
          setArticles(result);
        }
      }
    };
    fetchReviewRequest();
  }, [user_JWT_token]);

  const handleViewReview = (index) => {
    const review = articles[index];
    let revision_review_name = review.revision_review === 1 ? "Yes" : "No";
  
    setReviewDetails({
      outcome_name: review.outcome_name.charAt(0).toUpperCase() + review.outcome_name.slice(1),
      revision_review: revision_review_name,
      review_comments_editor: review.review_comments_editor,
      review_comments_author: review.review_comments_author,
    });
    setShowReviewPopup(true);
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
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    padding: "12px",
  };

  const buttonStyle = {
    padding: "5px 5px",
    border: "2px solid",
    backgroundColor: "transparent",
    borderRadius: "0px",
    color: "#963737",
    cursor: "pointer",
    fontSize: "14px",
    transition: "border 0.2s ease-in-out",
  };

  const buttonHoverStyle = {
    backgroundColor: "#f7f7f7",
    color: "#963737",
    border: "none",
    borderBottom: "4px solid #963737",
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

  const sectionStyle = {
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f5e6e6",
    marginTop: "2%",
  };

  const titleStyle = {
    fontWeight: "bold",
    fontSize: "30px",
    marginBottom: "10px",
    marginTop: "2%",
  };

  return (
    <div style={sectionStyle}>
      <h1 style={titleStyle}>Completed Reviews</h1>
      <input
        type="text"
        style={inputStyle}
        placeholder="Search articles..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, width: "5%" }}>Submission ID</th>
              <th style={{ ...headerCellStyle, width: "30%" }}>Title</th>
              <th style={{ ...headerCellStyle, width: "10%" }}>Review Date</th>
              <th style={{ ...headerCellStyle, width: "15%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((row, index) => (
              <tr key={index}>
                <td style={cellStyle}>{row.submission_id}</td>
                <td style={cellStyle}>{row.submission_title}</td>
                <td style={cellStyle}>
                  {new Date(row.review_time).toLocaleDateString()}
                </td>
                <td style={cellStyle}>
                  <button
                    style={{ ...buttonStyle, marginLeft: "20px", marginTop: "10px", marginBottom: "10px" }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor;
                      e.currentTarget.style.color = buttonHoverStyle.color;
                      e.currentTarget.style.border = buttonHoverStyle.border;
                      e.currentTarget.style.borderBottom = buttonHoverStyle.borderBottom;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
                      e.currentTarget.style.color = buttonStyle.color;
                      e.currentTarget.style.border = buttonStyle.border;
                    }}
                    onClick={() => {
                      console.log("Running here", row.submission_id, process.env.REACT_APP_HOST);
                      window.open(`http://${process.env.REACT_APP_HOST}/pdf-viewer?submission_id=${row.submission_id}`, '_blank');
                    }}
                  >
                    View Manuscript
                  </button>
                  <button
                    style={{ ...buttonStyle, marginLeft: "20px" }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor;
                      e.currentTarget.style.color = buttonHoverStyle.color;
                      e.currentTarget.style.border = buttonHoverStyle.border;
                      e.currentTarget.style.borderBottom = buttonHoverStyle.borderBottom;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
                      e.currentTarget.style.color = buttonStyle.color;
                      e.currentTarget.style.border = buttonStyle.border;
                    }}
                    onClick={() => handleViewReview(index)}
                  >
                    View Review
                  </button>
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
      {showReviewPopup && (
        <PopupSingleButton
          title="Review Details"
          text={`Outcome Selected: ${reviewDetails.outcome_name}<br /><br />
                Revision Review: ${reviewDetails.revision_review}<br /><br />
                Comments to Editor: ${reviewDetails.review_comments_editor}<br /><br />
                Comments to Author: ${reviewDetails.review_comments_author}`}
          button_text={"Close"}
          button_listener={() => setShowReviewPopup(false)}
      />
      
      
      )}
    </div>
  );
};

export default ReviewerCompletedDashboard;
