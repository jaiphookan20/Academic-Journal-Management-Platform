import React, { useState, useEffect } from "react";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";
import Logout from "./Logout.js";
import '@fortawesome/fontawesome-free/css/all.min.css';

const ReviewerManageRequest = () => 
{
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

  const [open, setOpen] = useState(false);
  const [openAbstract, setOpenAbstract] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logout, setLogout] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");

  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");


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

  // For fetching all review requests
  useEffect(() =>
  {
      const fetchReviewRequest = async () => {
      let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/get-unconfirmed-reviews`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user_JWT_token}`,
        },
      });
  
      result = await result.json();
      console.log(result, "Get review request response");
  
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
    fetchReviewRequest();
  },[user_JWT_token]);

  const viewAbstract = (index) =>
  {
    setPopupTitle("Abstract of submission: " + articles[index].submission_id);
    setPopupText(articles[index].submission_abstract);
    setOpenAbstract(true);
  }

  const handleAccept = async(index) => 
  {
    console.log("Accepted Review Request", index);
    const item = {reviewId: articles[index].review_id};
    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/accept-review-request`, {
      method: "POST",
      body: JSON.stringify(item),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${user_JWT_token}`,
      },
    });

    console.log(result, "Get accept request response");
    result = await result.json();

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
        setPopupTitle("Success");
        setPopupText("The review request has been accepted");
        setOpen(true);
        setSuccess(false);
        const new_articles = articles;
        new_articles.splice(index, 1);
        setArticles(new_articles);

        const new_filtered_array = []
        new_articles.forEach((element,index) => 
        {
          if(element.submission_title.toLowerCase().includes(searchTerm.toLowerCase()))
          {
            element.articles_array_index = index;
            new_filtered_array.push(element);
          }
        });
        setFilteredArticles(new_filtered_array);
      }
    }
  };

  const handleDecline = async(index) => 
  {
    console.log("Declined Review Request", articles[index].review_id);

    const item = {reviewId: articles[index].review_id};
    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/decline-review-request`, {
      method: "POST",
      body: JSON.stringify(item),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${user_JWT_token}`,
      },
    });

    console.log(result, "Get decline request response");
    result = await result.json();

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
        setPopupTitle("Success");
        setPopupText("The review request has been declined");
        setOpen(true);
        setSuccess(false);
        const new_articles = articles;
        new_articles.splice(index, 1);
        setArticles(new_articles);

        const new_filtered_array = []
        new_articles.forEach((element,index) => 
        {
          if(element.submission_title.toLowerCase().includes(searchTerm.toLowerCase()))
          {
            element.articles_array_index = index;
            new_filtered_array.push(element);
          }
        });
        setFilteredArticles(new_filtered_array);
      }
    }
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
    padding: '12px',
  };

  const iconButtonStyle = {
    margin: "5px",
    padding: "5px 5px",
    backgroundColor: "transparent",
    color: "#963737",
    border: "2px solid",
    borderRadius:'0px',
    cursor: "pointer",
    fontSize: "14px",
    transition: "border 0.2s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100px",
    height: "35px",
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
      <h1 style={titleStyle}>Manage Review Requests</h1>
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
              <th style={{ ...headerCellStyle, width: "1%" }}>Submission ID</th>
              <th style={{ ...headerCellStyle, width: "30%" }}>Title</th>
              <th style={{ ...headerCellStyle, width: "5%" }}>Target Date</th>
              <th style={{ ...headerCellStyle, width: "2%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((row, index) => (
              <tr key={index}>
                <td style={cellStyle}>{row.submission_id}</td>
                <td style={cellStyle}>{row.submission_title}
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
                    onClick={() => viewAbstract(row.articles_array_index)}>
                    [View Abstract]
                  </button>
                </td>
                <td style={cellStyle}>{row.target_date}</td>
                <td style={{...cellStyle,  alignItems: "center", justifyContent: "center"}}>
                  <button
                    style={iconButtonStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor;
                      e.currentTarget.style.color = buttonHoverStyle.color;
                      e.currentTarget.style.border = buttonHoverStyle.border;
                      e.currentTarget.style.borderBottom = buttonHoverStyle.borderBottom;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = iconButtonStyle.backgroundColor;
                      e.currentTarget.style.color = iconButtonStyle.color;
                      e.currentTarget.style.border = iconButtonStyle.border;
                    }}
                    onClick={() => handleAccept(row.articles_array_index)}
                  >
                    <i className="fas fa-check"></i> Accept
                  </button>
                  <button
                    style={iconButtonStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor;
                      e.currentTarget.style.color = buttonHoverStyle.color;
                      e.currentTarget.style.border = buttonHoverStyle.border;
                      e.currentTarget.style.borderBottom = buttonHoverStyle.borderBottom;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = iconButtonStyle.backgroundColor;
                      e.currentTarget.style.color = iconButtonStyle.color;
                      e.currentTarget.style.border = iconButtonStyle.border;
                    }}
                    onClick={() => handleDecline(row.articles_array_index)}
                  >
                    <i className="fas fa-times"></i> Reject
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
    </div>
  );
};

export default ReviewerManageRequest;
