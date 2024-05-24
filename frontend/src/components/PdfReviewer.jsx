import React, { Component} from "react";

import PdfLoader from "./PdfReviewerSource/src/components/PdfLoader.jsx";
import PdfHighlighter from "./PdfReviewerSource/src/components/PdfHighlighter.jsx";
import Tip from "./PdfReviewerSource/src/components/Tip.jsx";
import Popup from "./PdfReviewerSource/src/components/Popup.jsx";
import Highlight from "./PdfReviewerSource/src/components/Highlight.jsx";

import { Spinner } from "./PdfReviewerComponents/Spinner";
import { Sidebar } from "./PdfReviewerComponents/Sidebar";

import "./PdfReviewerComponents/Css/PdfReviewer.css";

import { PopupSingleButton } from './subComponents/PopupSingleButton.js';
import { PopupDoubleButton } from './subComponents/PopupDoubleButton.js';

const search = window.location.search;
const params = new URLSearchParams(search);
const submission_id = params.get('submission_id');

let user_JWT_token = null
const userDetails = JSON.parse(sessionStorage.getItem("details"));
if (userDetails)
  user_JWT_token = userDetails.jwt_token;

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({comment}) =>
  comment.text ? (<div className="Highlight__popup">{comment.emoji} {comment.text}</div>) : null;

class PdfReviewer extends Component
{
  state = {
    open_single: false,
    open_double: false,
    popupTitle: "Sample Popup Title",
    popupText: "Sample Popup Text",
    url: null,
    highlights: [],
    to_be_deleted: null
  };

  
  Initialise = async () =>
  {
  
    const access_token_response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/submission/get-submission-access/${submission_id}/true`,
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
    const highlights_response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/get-inline-comments/${submission_id}/true`,
    {
      method:"GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Authorization": `Bearer ${user_JWT_token}`,
      }
    });
  
    const highlight_array = await highlights_response.json();
  
    const highlights = []
  
    if(!highlight_array.error && !highlight_array.message)
    {
      highlight_array.forEach(element => 
      {
        const highlight = JSON.parse(element.comments)
        highlight.database_id = element.comment_id;
        if(userDetails.client_id === element.client_id)
          highlight.isOwner = true;
        else
          highlight.isOwner = false;
        if(element.client_id)
          highlight.commented_by = element.first_name+" "+element.last_name;
        highlights.push(highlight)
      });
    }
  
    this.setState({
      url:url,
      highlights: highlights
    });

  }

  scrollViewerTo = (highlight) => { };

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentDidMount() 
  {
    if(!userDetails)
      window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
    else if(!submission_id)
      window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`,'_self')
    else
      this.Initialise(); //Initialise the requisites

    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );
  }

  getHighlightById(id) {
    const { highlights } = this.state;

    return highlights.find((highlight) => highlight.id === id);
  }

  // Function that opens the promt for delete confirmation
  deleteHighlight_Prompt = async (highlight) => 
  {
    // Opens the double button popup for deletion confirmation
    this.setState({
      open_double:true,
      to_be_deleted: highlight
    });

  };

  // Function that deletes a highlight 
  deleteHighlight = async () => 
  {
    const { highlights,to_be_deleted } = this.state;

    // Request to backend to delete the comment entry
    const comment_to_delete = {comment_id: to_be_deleted.database_id }
    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/delete-inline-comment/${submission_id}`,
    {
      method:"DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Authorization": `Bearer ${user_JWT_token}`,
      },
      body:JSON.stringify(comment_to_delete)
    });

    result = await result.json();
    if(result.error)
    {
      if (result.error === "Unauthorized to delete comment")
      {
        this.setState({
          popupTitle : "Unauthorized to delete comment",
          popupText : "You are not allowed to delete comments now",
          open_single : true
        });
      }
      else
      {
        this.setState({
          popupTitle : "Error",
          popupText : "Either comment not found or server error.",
          open_single : true
        }); 
      }
    }
    else
    {
      // Removing the comment from the highlights array locally
      const index = highlights.indexOf(to_be_deleted);
      if (index !== -1) 
        highlights.splice(index, 1);    
    }

    this.setState({
      to_be_deleted: null,
      highlights: highlights, 
      open_double:false // Closes the double button popup
    });

  };

  // Function that creates and adds a new highlight
  async addHighlight(highlight) 
  {
    const { highlights } = this.state;

    const new_comment = { ...highlight, id: getNextId() }

    console.log("Saving highlight", JSON.stringify(new_comment));

    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/add-inline-comment/${submission_id}`,{
                method:"POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  "Authorization": `Bearer ${user_JWT_token}`,
                },
                body:JSON.stringify(new_comment)
        });
 
    result = await result.json();
    console.log(result);

    if (result.error)
    {
      if (result.error === "Unauthorized to add comment")
        {
          this.setState({
            popupTitle : "Unauthorized to add comment",
            popupText : "You are not allowed to add comments now",
            open_single : true
          });
        }
        else
        {
          this.setState({
            popupTitle : "Error",
            popupText : "Either comment not found or server error.",
            open_single : true
          }); 
        }
    }
    else
    {
      new_comment.database_id = result.comment_id;
      new_comment.isOwner = true;
      new_comment.commented_by = userDetails.first_name+" "+userDetails.last_name;
      this.setState({
        highlights: [new_comment, ...highlights],
      });
    }
  }


  render() {
    const { open_single,open_double, popupTitle, popupText, url, highlights} = this.state;
    return (
      <div className="pdf_reviewer_body" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
          highlights={highlights}
          deleteHighlight={this.deleteHighlight_Prompt}
        />
        <div
          style={{
            height: "100vh",
            width: "75vw",
            position: "relative",
          }}
        >
        {open_single ? <PopupSingleButton title={popupTitle} text={popupText} button_text={"Close"} button_listener={()=> {this.setState({open_single:false})}} />:null} 
        {open_double ? <PopupDoubleButton title={"Delete Comment"} text={"Are you sure you want to delete the comment?"}  button1_text={"Yes"}  button1_listener={()=> {console.log("Clicked");this.deleteHighlight();}} button2_text={"No"} button2_listener={()=> {this.setState({open_double:false,to_be_deleted: null})}} />:null} 

          <PdfLoader url={url} beforeLoad={<Spinner/>} 
          onError={()=> 
            {
                this.setState({popupTitle:"Unauthorized access",popupText:"Manuscript not available.",open_single:true});
            }}>

            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={resetHash}
                scrollRef={(scrollTo) => {
                  this.scrollViewerTo = scrollTo;

                  this.scrollToHighlightFromHash();
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      this.addHighlight({ content, position, comment });
                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {

                  const component = 
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                    />
 

                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={(popupContent) =>
                        {
                          setTip(highlight, (highlight) => popupContent)
                          console.log(component)
                        }
                      }
                      onMouseOut={hideTip}
                      key={index}
                      children={component}
                    />
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </div>
      </div>
    );
  }
}

export default PdfReviewer;

