import React from "react";
import "./Css/Dashboard.css";
import "./Css/EditorSubmissionBoard.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MdOutlineModeEdit } from 'react-icons/md';
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";

const EditorDashboard = () => {

  const navigate = useNavigate();

  const [editStatusId, setEditStatusId] = useState(null);

  const handleContactAuthor = (article) => {
    navigate('/contact-author', { state: { authorName: article.authorName, articleTitle: article.articleTitle } });
  };

  const Data  = [
    { articleTitle: 'The introduction to software and other things', 
      authorName: 'Aurora Mathew', 
      reviewers: ['Osila Posh', 'Lonaga Poshwa'], 
      currentstatus: 'Review' 
    },
    { articleTitle: 'The optimal data usage', 
      authorName: 'Louis H', 
      reviewers: ['Andrew M', 'Adan Matt'], 
      currentstatus: 'Accepted' 
    },
  ];

  const [articles, setArticles] = useState(Data);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  const handleStatusChange = (event, index) => {
    const newArticles = [...articles];
    newArticles[index].currentstatus = event.target.value;
    setArticles(newArticles);
  };
  
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value !== "") {
      const filteredData = Data.filter(
        (item) =>
          item.articleTitle
            .toLowerCase()
            .includes(event.target.value.toLowerCase()) ||
          item.authorName
            .toLowerCase()
            .includes(event.target.value.toLowerCase()) ||
          item.reviewers.some(reviewer =>
            reviewer.toLowerCase().includes(event.target.value.toLowerCase())
          ) ||
          item.currentstatus
            .toLowerCase()
            .includes(event.target.value.toLowerCase())
      );
      setArticles(filteredData);
    } else {
      setArticles(Data);
    }
  };

  const tableStyle = {
    margin: "40px auto",
    borderCollapse: "separate",
    borderSpacing: "0",
    overflow: "hidden",
    width: "100%",
    borderRadius: "8px",
  };
  const cellStyle = {
    background: '#fff',
    boxShadow: '2px 4px 8px rgba(0,0,0,0.1)',
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

  // The names will be fetched from API
  const reviewerNames = ["Lonaga Poshwa", "Osila Posh", "Andrew M", "Adan Matt"];
  const [selectedReviewer, setSelectedReviewer] = useState("");

  const handleEditorChange = (event) => {
    setSelectedReviewer(event.target.value);
  };

  const assignReviewer = () => {
    // Call the API here
    if (selectedReviewer === "") {
      setPopupTitle("No User Selected");
      setPopupText("Please select a user first");
      setOpen(true);
      setSuccess(false);
      return;
    }
    setPopupTitle("User Assigned");
    setPopupText(
      `The User: ${selectedReviewer} is now ASSIGNED as a Reviewer!`
    );
    setOpen(true);
    setSuccess(false);
    setSelectedReviewer("");
  };

  return (
    <>
      <div className="dashboard-container">
        <center>
          <h1>Welcome to your Editor Dashboard!</h1>
          <h4>You can view the status of the Submissions here.</h4>
          <input
            type="text"
            className="search-input"
            placeholder="Search articles/authors/reviewers..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="table-responsive">
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>No.</th>
                  <th style={headerCellStyle}>Article Title</th>
                  <th style={headerCellStyle}>Author/Authors name</th>
                  <th style={headerCellStyle}>Reviewers</th>
                  <th style={headerCellStyle}>Current Status</th>
                  <th style={headerCellStyle}>Contact Author</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((row, index) => (
                  <tr key={index}>
                    <td style={cellStyle}>{index + 1}</td>
                    <td style={cellStyle}>{row.articleTitle}</td>
                    <td style={cellStyle}>{row.authorName}</td>
                    <td style={cellStyle}>{row.reviewers.join(", ")}</td>
                    <td style={cellStyle}>
                      {editStatusId === index ? (
                        <>
                          <select
                            value={row.currentstatus}
                            onChange={(e) => handleStatusChange(e, index)}
                            onBlur={() => setEditStatusId(null)}
                            style={{ marginRight: '10px' }}
                          >
                            <option value="Accepted">Accepted</option>
                            <option value="Review">Review</option>
                            <option value="Desk Reject">Desk Reject</option>
                            <option value="Reject">Reject</option>
                          </select>
                          <FaCheck 
                            onClick={() => setEditStatusId(null)} 
                            style={{ cursor: 'pointer', color: 'gray', fontSize: '20px' }} 
                          />
                        </>
                      ) : (
                        <>
                          <span>{row.currentstatus}</span>
                          <MdOutlineModeEdit 
                            onClick={() => setEditStatusId(index)} 
                            style={{ cursor: 'pointer', marginLeft: '10px', color: 'gray', fontSize: '20px' }} 
                          />
                        </>
                      )}
                    </td>
                    <td style={cellStyle}>
                      <button 
                        className="contact-button" 
                        onClick={() => handleContactAuthor(row)}
                      >
                        Contact Author
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link
              className="submit"
              to="/editor-submission-board"
              style={{ textDecoration: 'none' }}
            >
              Click to Edit the Reviewers.
            </Link>
          </div>
        </center>
      </div>

      <div className="dashboard-editor-assign">
        <center>
          <h3>You can Assign New Reviewers here. Select from below</h3>
          <div className="menu-dropdown">
            <label
              htmlFor="reviewersDropdown"
              style={{
                display: "inline-block",
                width: "350px",
                paddingLeft: "20px",
              }}
            >
              <b>Select a Reviewer: </b>
            </label>
            <select
              id="reviewersDropdown"
              value={selectedReviewer}
              onChange={handleEditorChange}
              className="dark-dropdown"
            >
              <option value="">Select a Reviewer to be assigned</option>
              {reviewerNames.map((reviewer, index) => (
                <option key={index} value={reviewer}>
                  {reviewer}
                </option>
              ))}
            </select>
          </div>

          <button
            className="submit"
            onClick={assignReviewer}
          >
            Assign User as Reviewer
          </button>
          {open ? (
            success ? (
              <PopupSingleButton
                title={popupTitle}
                text={popupText}
                button_text={"Close"}
                button_listener={() => {
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
        </center>
      </div>
    </>
  );
};

export default EditorDashboard;
