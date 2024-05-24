import React, { useState } from 'react';
import "./Css/Reviewform.css";
import { useLocation } from 'react-router-dom';
import Logout from "./Logout.js";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";

const ReviewerForm = () => 
{
  const location = useLocation();
  const articleTitle = location.state?.submissionTitle || "";
  const targetDate = location.state?.targetDate || "";
  const submissionId = location.state?.submissionId || ""; 

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
  else if(articleTitle === "" || targetDate === "" || submissionId === "")
  {
    window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`,'_self')
  }

  const [articleTitleName, setArticleTitleName] = useState(articleTitle);
  const [reviewerName, setReviewerName] = useState(userDetails.first_name + ' ' + userDetails.last_name);
  const [contactDetails, setContactDetails] = useState(userDetails.email);
  const [targetDateValue, setTargetDateValue] = useState(targetDate);
  const [outcomeRecommendation, setOutcomeRecommendation] = useState('');
  const [reviewCommentsEditor, setReviewCommentsEditor] = useState('');
  const [reviewCommentsAuthor, setReviewCommentsAuthor] = useState('');
  const [revisionReview, setRevisionReview] = useState('');

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logout, setLogout] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");
  

  const handleSubmit = async () => {
    // Add client-side validation
    if (
      !submissionId ||
      !outcomeRecommendation ||
      !reviewCommentsEditor ||
      !reviewCommentsAuthor ||
      revisionReview === undefined // revisionReview can be false, so we explicitly check for undefined
    ) 
    {
      setPopupTitle("Missing fields");
      setPopupText("All fields are mandatory");
      setOpen(true);
      setSuccess(false);
      return;
    }

    if (!Number.isInteger(parseInt(outcomeRecommendation))) 
    {
      setPopupTitle("Incorrect field");
      setPopupText("Please provide a valid outcome recommentation");
      setOpen(true);
      setSuccess(false);
      return;
    }

    const reviewData = {
      submissionId,
      outcomeRecommendation: parseInt(outcomeRecommendation),
      reviewCommentsEditor,
      reviewCommentsAuthor,
      revisionReview,
    };
    console.log(reviewData);

    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/submit-review`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user_JWT_token}`,
        },
      });

      if (response.error) 
      {
        setPopupTitle("Error");
        setPopupText(response.error);
        setOpen(true);
        setSuccess(false);
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
          setPopupTitle("Success");
          setPopupText("Review has been submitted");
          setOpen(true);
          setSuccess(true);
        }
      }

    //   if (!response.ok) {
    //     const errorDetails = await response.json();
    //     console.error('Network response was not ok', response.status, errorDetails);
    //     throw new Error('Network response was not ok');
    //   }

    //   const result = await response.json();
    //   console.log('The Review is sent.', result);
    //   navigate('/review');
    } 
    catch (error) 
    {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (
    <div style={{marginLeft:"10vw"}}>
      <div className="review-container">
      <h3 style={{ color: "#963737" }}>
        STUDIES IN LANGUAGE ASSESSMENT: The international journal of the
        Association for Language Testing and Assessment of Australia and New
        Zealand.
      </h3>
      <table className="table">
        <tbody>
          <tr>
            <th className="th-wide"><i>Article title:</i></th>
            <td>
              <textarea
                rows="3"
                cols="100"
                value={articleTitleName}
                onChange={e => setArticleTitleName(e.target.value)}
                disabled={true}
                style={{ resize: "none" }}

              />
            </td>
          </tr>
          <tr>
            <th className="th-wide"><i>Reviewer's name:</i></th>
            <td>
              <textarea
                rows="2"
                cols="100"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                style={{ resize: "none" }}
                disabled={true}
              />
            </td>
          </tr>
          <tr>
            <th><i>Reviewer's contact details:</i></th>
            <td>
              <textarea
                rows="2"
                cols="100"
                value={contactDetails}
                onChange={e => setContactDetails(e.target.value)}
                style={{ resize: "none" }}
                disabled={true}
              />
            </td>
          </tr>
          <tr>
            <th><i>Target date:</i></th>
            <td>
              <input
                type="date"
                value={targetDateValue}
                onChange={e => setTargetDateValue(e.target.value)}
                disabled={true}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <b><p style={{ color: "#963737" }}>Information for reviewers</p></b>
      <p>
        <i>Studies in Language Assessment (SiLA)</i> is the international
        peer-reviewed research journal of the Association for Language Testing
        and Assessment of Australia and New Zealand (
        <a href="https://altaanz.org/" target="_blank" rel="noreferrer">ALTAANZ</a>
        ). It previously appeared under the title <i>Papers in Language Testing
        and Assessment (PLTA)</i>. The journal is an online, open-access
        publication that welcomes contributions from both new and experienced
        researchers in the form of full research articles, research reports
        and discussion papers on topics in the field of language assessment.
        It also publishes commissioned book and test reviews. Currently, there
        are at least one regular issue and one theme-based special issue each
        year. SiLA is included in the Web of Science Emerging Sources Citation
        Index (ESCI).
      </p>
      <p>
        <i>SiLA</i> is available exclusively online at{" "}
        <a href="https://altaanz.org/" target="_blank" rel="noreferrer">ALTAANZ</a>{" "}
        and the{" "}
        <a
          href="https://arts.unimelb.edu.au/language-testing-research-centre/research/publications"
          target="_blank"
          rel="noreferrer"
        >
          {" "}
          Language Testing Research Centre
        </a>
        .
      </p>
      <b><p style={{ color: "#963737" }}>Reviewing Guidelines</p></b>
      <p>
        Reviewers are asked to make a recommendation on a paper using one of
        four categories (accept, accept with revisions, revise and resubmit,
        reject).
      </p>
      <p>
        As you write your review, please keep the following issues in mind:
      </p>
      <ul>
        <li>The relevance of the topic to the Language Testing field.</li>
        <li>The originality of the contribution.</li>
        <li>The logic and clarity of the argument.</li>
        <li>The soundness of the research design.</li>
        <li>The extent to which conclusions are justified.</li>
        <li>The clarity and quality of writing.</li>
      </ul>
      <p>
        If you have any questions about the review process, please email the
        Editorial Assistant, Annemiek Huisman, at{" "}
        <a href="mailto:sila.editors@gmail.com">sila.editors@gmail.com</a>.
      </p>
      <b><p style={{ color: "#963737" }}>Recommendation (Select the relevant outcome):</p></b>
      <div>
        <div>
          <input
            type="radio"
            id="accept"
            name="decision"
            value="1" // Use integer values for radio buttons
            onChange={e => setOutcomeRecommendation(e.target.value)}
          />
          <label htmlFor="accept" style={{ marginLeft: "10px" }}>
            Accept
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="acceptMinorRevisions"
            name="decision"
            value="2" // Use integer values for radio buttons
            onChange={e => setOutcomeRecommendation(e.target.value)}
          />
          <label
            htmlFor="acceptMinorRevisions"
            style={{ marginLeft: "10px" }}
          >
            Accept with minor revisions
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="reviseResubmit"
            name="decision"
            value="3" // Use integer values for radio buttons
            onChange={e => setOutcomeRecommendation(e.target.value)}
          />
          <label htmlFor="reviseResubmit" style={{ marginLeft: "10px" }}>
            Revise & resubmit
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="reject"
            name="decision"
            value="4" // Use integer values for radio buttons
            onChange={e => setOutcomeRecommendation(e.target.value)}
          />
          <label htmlFor="reject" style={{ marginLeft: "10px" }}>
            Reject
          </label>
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <b><p style={{ color: "#963737" }}>Would you be willing to review a revision of this manuscript?:</p></b>
        <input
          type="radio"
          id="reviewyes"
          name="review"
          value = 'true'
          onChange={e => setRevisionReview(e.target.value)}
        />
        <label htmlFor="acceptMinorRevisions" style={{ marginLeft: "10px" }}>
          Yes
        </label>
        <input
          type="radio"
          id="reviewno"
          name="review"
          value='false'
          style={{ marginLeft: "75px" }}
          onChange={e => setRevisionReview(e.target.value)}
        />
        <label htmlFor="acceptMinorRevisions" style={{ marginLeft: "10px" }}>
          No
        </label>
      </div>
      <div style={{ marginTop: "25px" }}>
        <b><p style={{ color: "#963737" }}>Comments to the Editors (confidential):</p></b>
        <textarea
          rows="7"
          cols="140"
          style={{ resize: "none" }}
          value={reviewCommentsEditor}
          onChange={e => setReviewCommentsEditor(e.target.value)}
        />
      </div>
      <div style={{ marginTop: "25px" }}>
        <b><p style={{ color: "#963737" }}>Comments to the Author(s):</p></b>
        <textarea
          rows="7"
          cols="140"
          style={{ resize: "none" }}
          value={reviewCommentsAuthor}
          onChange={e => setReviewCommentsAuthor(e.target.value)}
        />
      </div>
      <div className="submit-container">
        <button
          className="submit"
          onClick={handleSubmit}
        >
          Submit Review
        </button>
      </div>
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
    </div>
  );
};

export default ReviewerForm;
