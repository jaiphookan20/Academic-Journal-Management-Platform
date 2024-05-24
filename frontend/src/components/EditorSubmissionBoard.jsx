import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import Logout from "./Logout.js";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";

const EditorSubmissionBoard = () => 
{
  let userDetails = JSON.parse(sessionStorage.getItem("details"));
  
  let user_JWT_token = null;
  
  if(userDetails)
    user_JWT_token = userDetails.jwt_token;
  
  if(!user_JWT_token)
  {
    window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
  }
  else if(!userDetails.roles.includes(1))
  {
    window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`,'_self')
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [editModeIndex, setEditModeIndex] = useState(null);
  const [selectedReviewers, setSelectedReviewers] = useState({});
  const [reviewDates, setReviewDates] = useState({});
  const [showDateInput, setShowDateInput] = useState({});
  const [reviewerOptions, setReviewerOptions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAbstract, setOpenAbstract] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logout, setLogout] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

  // Fetch reviewers
  useEffect(() => {
    const fetchReviewers = async () => {
      let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/get-reviewers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user_JWT_token}`,
        },
      });

      result = await result.json();
      console.log(result, "Get all reviewers response");

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
          setReviewerOptions(result); // Save the entire reviewer objects
        }
      }
    }
    fetchReviewers();
  }, [user_JWT_token]);

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/editorial-decisions/get-all-current-submissions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user_JWT_token}`,
        },
      });

      result = await result.json();
      console.log(result, "Get all submissions response");

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
        } 
        else 
        {
          const submissions = result.map(submission => {
            let author_string = '';
            try {
              const author_list = JSON.parse(submission.authors);
              author_string = author_list.map(author => `${author.first_name} ${author.last_name}`).join(", ");
            } catch (e) {
              console.error("Error parsing authors JSON:", e);
              author_string = submission.authors; // fallback to raw data
            }

            submission.authors = author_string;

            submission.review_requests.forEach(request => {
              if(request.confirm_to_editor == null)
                request.confirm_to_editor = "Pending"
              else if(request.confirm_to_editor === 1)
                request.confirm_to_editor = "Accepted"
              else
                request.confirm_to_editor = "Rejected"
            });

            return submission;
          });

          setSubmissions(submissions);
          setFilteredSubmissions(submissions);
        }
      }
    }
    fetchSubmissions();
  }, [user_JWT_token]);

  // Search functionality
  useEffect(() => {
    if (searchTerm === "") 
    {
      setFilteredSubmissions(submissions);
      console.log("Coming here");
    } 
    else {
      const filteredData = submissions.filter(
        (item) =>
          item.submission_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.reviewers && item.reviewers.some((reviewer) =>
            reviewer.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      );
      setFilteredSubmissions(filteredData);
    }
  }, [searchTerm, submissions]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEditReviewers = (index, currentReviewers) => {
    setEditModeIndex(index);
    setSelectedReviewers((prev) => ({
      ...prev,
      [index]: currentReviewers.map((reviewer) => ({
        value: reviewer.client_id, // Store the client ID
        name: reviewer.name, // Store the reviewer name for display
        editable: false,
      })),
    }));
    handleAddReviewer(index);
  };

  const handleAddReviewer = (index) => {
    const updatedReviewers = [...(selectedReviewers[index] || [])];
    updatedReviewers.push({ value: "", name: "", editable: true });
    setSelectedReviewers((prev) => ({
      ...prev,
      [index]: updatedReviewers,
    }));
    setShowDateInput((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const handleReviewerChange = (index, reviewerIndex, value) => 
  {
    const updatedReviewers = [...selectedReviewers[index]];
    let selectedReviewer = null
    reviewerOptions.forEach(element => {
      console.log(element.client_id, value)
      if (element.client_id === parseInt(value)) {
        selectedReviewer = element
      }
    });

    updatedReviewers[reviewerIndex].value = value;
    updatedReviewers[reviewerIndex].name = selectedReviewer ? `${selectedReviewer.first_name} ${selectedReviewer.last_name}` : '';
    setSelectedReviewers((prev) => ({
      ...prev,
      [index]: updatedReviewers,
    }));
  };

  const handleRemoveReviewer = () => 
  {
      setSelectedReviewers([])
      setEditModeIndex(null);
      setShowDateInput({});
  };

  const handleReviewDateChange = (index, date) => 
  {
    
    setReviewDates((prev) => ({
      ...prev,
      [index]: date,
    }));
  };

  const handleSendRequest = async (index) => {
    const updatedArticles = [...filteredSubmissions];
    const reviewer_ids = selectedReviewers[index].map((reviewer) => reviewer.value);
    const reviewers_names = selectedReviewers[index].map((reviewer) => reviewer.name);
    const targetDate = reviewDates[index];

    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/assign-reviewer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user_JWT_token}`,
        },
        body: JSON.stringify({
          submissionId: updatedArticles[index].submission_id,
          reviewerId: reviewer_ids[0],
          targetDate,
        }),
      });

      const result = await response.json();

      if (response.ok) 
      {
        setFilteredSubmissions(updatedArticles);

        const updatedSubmissions = submissions;
        updatedSubmissions.forEach(submission => 
        {
          if(submission.submission_id === updatedArticles[index].submission_id)
            submission.review_requests.push({ reviewer_name: reviewers_names[0], target_date: targetDate, confirm_to_editor: "Pending" });
        });
        setSubmissions(updatedSubmissions);

        console.log(reviewers_names);
        setEditModeIndex(null);

        // Destroy the date field and disable dropdown
        setReviewDates((prev) => ({
          ...prev,
          [index]: null,
        }));

        setShowDateInput((prev) => ({
          ...prev,
          [index]: false,
        }));

        console.log("Sent the request to new reviewer:", reviewer_ids, "on date:", targetDate);
      } else {
        console.error("Error assigning reviewer:", result.error);
        setPopupTitle("Error");
        setPopupText(result.error);
        setOpen(true);
        setSuccess(false);
      }
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      setPopupTitle("Error");
      setPopupText(error.message);
      setOpen(true);
      setSuccess(false);
    }
  };

  const getAvailableReviewers = (currentReviewers, currentReviewer) => {
    return reviewerOptions.filter(
      (reviewer) =>
        !currentReviewers.some((r) => r.value === reviewer.client_id) ||
        currentReviewer === reviewer.client_id
    );
  };

  const allReviewersSelected = (reviewers) => {
    return reviewers.every((reviewer) => reviewer.value !== "");
  };

  const tableStyle = {
    margin: "40px auto",
    borderCollapse: "separate",
    borderSpacing: "0",
    overflow: "hidden",
    width: "100%",
    borderRadius: "20px",
  };
  

  const cellStyle = {
    background: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    margin: "10px 0",
    padding: "10px",
    border: "none",
    position: "relative",
  };

  const headerCellStyle = {
    ...cellStyle,
    background: "#f5f5f5",
    color: "#333",
    fontWeight: "bold",
    boxShadow: "none",
  };

  const noColumnStyle = {
    ...cellStyle,
    width: "5%",
    textAlign: "center",
  };

  const reviewersColumnStyle = {
    ...cellStyle,
    width: "30%",
  };

  const saveButtonStyle = (disabled) => ({
    position: "relative",
    top: "5px",
    background: disabled ? "#d3d3d3" : "#963737",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    marginLeft: "10px",
    marginBottom: "2%",
  });


  const addButtonStyle = {
    background: "linear-gradient(90deg, #963737, #d87979)",
    border: "none",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    fontSize: "14px",
    transition: "background 0.3s, box-shadow 0.3s",
  };

  const addButtonHoverStyle = {
    background: "linear-gradient(90deg, #963a3a, #d48383)",
    boxShadow: "0px 4px 15px 0px rgba(150, 58, 58, 0.6)",
  };

  const dateInput = {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "5px 10px",
    fontSize: "14px",
    marginRight: "10px",
  };


  return (
    <div className="dashboard-container">
      <center>
        <h2>
          <b>Edit the Reviewers by clicking the icon </b>
        </h2>
        <input
          type="text"
          className="search-input"
          placeholder="Search articles/authors/reviewers..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </center>
      <div className="table-responsive">
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Submission ID</th>
              <th style={headerCellStyle}>Article Title</th>
              <th style={headerCellStyle}>Author/Authors name</th>
              <th style={{...headerCellStyle,width:"40%"}}>Reviewers</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((submission, index) => (
              <tr key={index} style={{ background: "transparent" }}>
                <td style={noColumnStyle}>{submission.submission_id}</td>
                <td style={cellStyle}>{submission.submission_title}</td>
                <td style={cellStyle}>{submission.authors}</td>
                <td style={reviewersColumnStyle}>
                  {editModeIndex === index ? (
                    <>
                      {selectedReviewers[index]?.map((reviewer, reviewerIndex) => (
                        <div key={reviewerIndex} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                          <select
                            className="select"
                            value={reviewer.value}
                            onChange={(e) =>
                              handleReviewerChange(index, reviewerIndex, e.target.value)
                            }
                            disabled={!reviewer.editable}
                          >
                            <option value="" disabled>
                              Select Reviewer
                            </option>
                            {getAvailableReviewers(selectedReviewers[index], reviewer.value).map(
                              (option) => (
                                <option key={option.client_id} value={option.client_id}>
                                  {option.first_name} {option.last_name}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      ))}
                      {showDateInput[index] && (
                        <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                          <input
                            type="date"
                            className="dateInput"
                            style={dateInput}
                            value={reviewDates[index] || ""}
                            onChange={(e) => handleReviewDateChange(index, e.target.value)}
                            min={today}
                          />
                          <button
                            className="sendRequestButton"
                            style={saveButtonStyle(!reviewDates[index] || !allReviewersSelected(selectedReviewers[index]))}
                            onClick={() => handleSendRequest(index)}
                            disabled={!reviewDates[index] || !allReviewersSelected(selectedReviewers[index])}
                            data-tooltip-id={`tooltip-${index}`}
                            data-tooltip-content={(!reviewDates[index] || !allReviewersSelected(selectedReviewers[index])) ? 'Send Request button is disabled until a date is chosen and all reviewers are selected.' : ''}
                          >
                            Send Request
                          </button>
                          <Tooltip id={`tooltip-${index}`} place="top" effect="solid" />
                        </div>
                      )}
                      <button
                        className="addButton"
                        style={addButtonStyle}
                        onMouseEnter={(e) => {
                          e.target.style.background = addButtonHoverStyle.background;
                          e.target.style.boxShadow = addButtonHoverStyle.boxShadow;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = addButtonStyle.background;
                          e.target.style.boxShadow = "none";
                        }}
                        onClick={() => handleRemoveReviewer(index)}
                      >
                        Back
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <div>
                          {submission.review_requests ? (
                            <table style={{...tableStyle,marginTop:"0px",marginBottom:"0px"}}>
                              <thead>
                                <tr>
                                  <th style={cellStyle}>Reviewer Name</th>
                                  <th style={cellStyle}>Target Date</th>
                                  <th style={cellStyle}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {submission.review_requests.map((request, reviewIndex) => (
                                  <tr key={reviewIndex} style={{ background: "transparent" }}>
                                    <td style={cellStyle}>{request.reviewer_name}</td>
                                    <td style={cellStyle}>{request.target_date}</td>
                                    <td style={cellStyle}>{request.confirm_to_editor}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : "No reviewers assigned"}
                        </div>
                        <button
                          className="editButton"
                          style={addButtonStyle}
                          onClick={() =>
                            handleEditReviewers(index, submission.reviewers || [])
                          }
                        >
                          <AiOutlinePlus style={{ marginRight: "5px" }} /> Add Reviewer
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <center>
        <Link
          className="submit"
          to="/editor-dashboard"
          style={{ textDecoration: "none" }}
        >
          Return Back to Dashboard
        </Link>
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
              style={{ width: '80%' }}
              button_listener={() => { setOpenAbstract(false); }}
            />)
          : null}
      </center>
    </div>
  );
};

export default EditorSubmissionBoard;
