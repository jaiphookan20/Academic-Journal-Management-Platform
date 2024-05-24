import React, { Component } from "react";

import PdfLoader from "./PdfReviewerSource/src/components/PdfLoader.jsx";
import PdfHighlighter from "./PdfReviewerSource/src/components/PdfHighlighter.jsx";
import Popup from "./PdfReviewerSource/src/components/Popup.jsx";
import Highlight from "./PdfReviewerSource/src/components/Highlight.jsx";


import { Spinner } from "./PdfReviewerComponents/Spinner";
import { SidebarViewer } from "./PdfReviewerComponents/SidebarViewer";

import "./PdfReviewerComponents/Css/PdfReviewer.css";

import { PopupSingleButton } from './subComponents/PopupSingleButton.js';
import { PopupDoubleButton } from './subComponents/PopupDoubleButton.js';

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({comment}) =>
  comment.text ? (<div className="Highlight__popup">{comment.emoji} {comment.text}</div>) : null;


const search = window.location.search;
const params = new URLSearchParams(search);
const submission_id = params.get('submission_id');

let user_JWT_token = null
const userDetails = JSON.parse(sessionStorage.getItem("details"));
if (userDetails)
  user_JWT_token = userDetails.jwt_token;

class PdfViewer extends Component
{

  state = {
    open_single: false,
    open_double: false,
    popupTitle: "Sample Popup Title",
    popupText: "Sample Popup Text",
    url: null,
    isEditor: null,
    highlights: [],
    to_be_deleted: null
  };

  Initialise = async () =>
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
    console.log(access_token_json)

    const url = `http://${process.env.REACT_APP_API_HOST}:8080/submission/get-manuscript/${access_token}`;
    const highlights_response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/get-inline-comments/${submission_id}/false`,
    {
      method:"GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Authorization": `Bearer ${user_JWT_token}`,
      }
    });

    const highlight_array = await highlights_response.json();

    console.log(highlight_array)

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
        if(element.visible_to_author!== null)
        {
          if(element.visible_to_author === 1)
            highlight.visible_to_author = true;
          else
            highlight.visible_to_author = false;
          console.log(highlight.visible_to_author,"visibility")
        }
        highlights.push(highlight)
      });
    }

    this.setState({
      url:url,
      highlights: highlights
    });
  }

  updateVisibility = async (index) =>
  { 
    const { highlights } = this.state;
    const highlights_current = highlights; 
    highlights_current[index].visible_to_author = !highlights_current[index].visible_to_author;
    this.setState({highlights:highlights_current})

    // Request to backend to update the comment visibility
    const body = {comment_id: highlights_current[index].database_id, visible_to_author: highlights_current[index].visible_to_author}

    const update_visibility_response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/review/change-visibility-inline-comment/${submission_id}`,
    {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Authorization": `Bearer ${user_JWT_token}`,
      },
      body:JSON.stringify(body)
    });

    const result = await update_visibility_response.json();

    if(result.error)
    {
      this.setState({
        popupTitle : "Error",
        popupText : result.error,
        open_single : true
      }); 
    }
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
    {

      this.setState({
        isEditor : userDetails.roles.includes(1)
      });  
      
      this.Initialise();
    }

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

  render() {
    const { open_single,open_double, popupTitle, popupText, url, highlights, isEditor} = this.state;
    return (
      <div className="pdf_reviewer_body" style={{ display: "flex", height: "100vh" }}>
        <SidebarViewer
          highlights={highlights}
          isEditor={isEditor}
          setState={this.updateVisibility}
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
                this.setState({popupTitle:"Not found",popupText:"Manuscript not available. Please navigate back to home",open_single:true});
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
                
                onSelectionFinished={() => {console.log("selected");}}

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

export default PdfViewer;

