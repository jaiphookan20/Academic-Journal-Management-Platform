import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FirstPage from './subComponents/FirstPageSubmission';
import SecondPage from './subComponents/SecondPageSubmission';
import ThirdPage from './subComponents/ThirdPageSubmission';
import FourthPage from './subComponents/FourthPageSubmission';
import FifthPage from './subComponents/FifthPageSubmission';
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";
import RefreshToken from './RefreshToken';
import Logout from "./Logout.js";
import "./Css/Form.css";

const steps = ['Author Details', 'Submission details', 'Conflict of interest ', 'Attach Files', 'Check Details'];
const search = window.location.search;
const params = new URLSearchParams(search);
const parent_submission_Id = params.get('parent_submission_id');

export default function Form() 
{
  const [parentSubmissionId] = React.useState(parent_submission_Id);
  const [activeStep, setActiveStep] = React.useState(0);
  const [articleTitle, setArticleTitle] = React.useState('');
  const [submissionType, setSubmissionType] = React.useState('');
  const [acknowledgements, setAcknowledgements] = React.useState('');
  const [abstract, setAbstract] = React.useState('');
  const [conflictInterest, setConflictInterest] = React.useState(false);
  const [conflictDetail, setConflictDetail] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [file_descriptions, setFileDescriptions] = React.useState([]);

  const [open, setOpen] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [logout, setLogout] = React.useState(false);
  const [popupTitle, setPopupTitle] = React.useState("Sample Popup Title");
  const [popupText, setPopupText] = React.useState("Sample Popup Text");

  const userDetails = JSON.parse(sessionStorage.getItem("details"));
  let user_JWT_token = null;
    if(userDetails)
        user_JWT_token = userDetails.jwt_token;

  const [authors, setAuthors] = React.useState([
    { firstName: userDetails.first_name, lastName: userDetails.last_name, affiliation: userDetails.institution_name, academicTitle: '', orcid: userDetails.orcid}
    ]
  );

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const is_valid_orcid = (orcid) => {
    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    return orcidRegex.test(orcid);
  };

  const areAuthorsDetailsComplete = (authors) => {
    return authors.every(author =>
      author.firstName && author.lastName && author.affiliation && author.orcid && author.academicTitle && is_valid_orcid(author.orcid)
    );
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  
  const handleSubmit = async () => 
  {
    const submissionData = new FormData();
    submissionData.append('submission_title', articleTitle);
    submissionData.append('submission_type', submissionType);
    submissionData.append('abstract', abstract);
    submissionData.append('acknowledgements', acknowledgements);
    submissionData.append('conflict_of_interest', conflictInterest ? conflictDetail : "No");
    submissionData.append('file_descriptions', file_descriptions);
    if(parentSubmissionId){
      submissionData.append('parent_submission_id', parentSubmissionId);
    }
    
    const simplifiedAuthors = authors.map(author => ({
      first_name: author.firstName,
      last_name: author.lastName,
      academic_title: author.academicTitle,
      affiliation: author.affiliation,
      orcid:author.orcid
    }));
    submissionData.append('authors', JSON.stringify(simplifiedAuthors));

    files.forEach(element => {
      submissionData.append('files', element);
    });
    
    // Logging submission data
    console.log('Submission data:',submissionData);

    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/submission/`, {
        method: "POST",
        body: submissionData,
        headers: {
          "Authorization": `Bearer ${user_JWT_token}`,
        },
      });
      const data = await result.json();
      console.log(data)

      if(data.error)
      {
        setPopupTitle("Error");
        setPopupText(data.error);
        setOpen(true);
        setSuccess(false);
      }
      else
      {
        if(data.message === "jwt expired")
        {
          const loginRefreshStatus =  await RefreshToken();
          if(!loginRefreshStatus)
          {
            setPopupTitle("Login expired");
            setPopupText("Please try to login again from the home");
            setOpen(true);
            setLogout(true);
            setSuccess(true);
          }
          else
          {
            user_JWT_token = loginRefreshStatus;
            console.log("Refreshing login",loginRefreshStatus)
            handleSubmit();
          }
        }
        else
        {
          setActiveStep(steps.length);
        }
      }
  };
  

  const handleReset = () => {
    setActiveStep(0);
    setArticleTitle('');
    setSubmissionType('');
    setAcknowledgements('');
    setAbstract('');
    setConflictInterest(false);
    setConflictDetail('');
    setFileDescriptions([]);
    setAuthors([
      { firstName: userDetails.first_name, lastName: userDetails.last_name, affiliation: userDetails.institution_name, academicTitle: '', orcid: userDetails.orcid}
    ]);
  };

  return (
    <div className='container-form' style={{padding: '20px', paddingTop: '5rem'}}>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length ? (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              <h3 style={{color: '#6f141b', paddingTop:'3rem'}}><b>Your article has been submitted.</b></h3>
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset} variant="contained" sx={{backgroundColor: "#b25259"}}>Home</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {activeStep === 0 && <FirstPage authors={authors} setAuthors={setAuthors} />}
            {activeStep === 1 && <SecondPage articleTitle={articleTitle} setArticleTitle={setArticleTitle} abstract={abstract} setAbstract={setAbstract} submissionType = {submissionType} setSubmissionType={setSubmissionType} acknowledgements = {acknowledgements} setAcknowledgements={setAcknowledgements}/>}
            {activeStep === 2 && <FourthPage onConflictInterestChange={(conflict, detail) => { setConflictInterest(conflict); setConflictDetail(detail);}}/>}
            {activeStep === 3 && <ThirdPage setFileDescriptions={setFileDescriptions} setFiles={setFiles} />}
            {activeStep === 4 && <FifthPage 
              articleTitle={articleTitle} 
              abstract={abstract} 
              submissionType={submissionType} 
              acknowledgements={acknowledgements} 
              authors={authors} 
              conflictInterest={conflictInterest} 
              conflictDetail={conflictDetail} 
            />}
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1}}
                variant="contained"
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
                <Button
                className='button'
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                sx={{backgroundColor: "#b25259"}}
                variant="contained"
                disabled={
                  (activeStep === 1 && (!articleTitle || !abstract || !submissionType || !acknowledgements)) ||
                  (activeStep === 0 && !areAuthorsDetailsComplete(authors))
                }
                >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
            </Box>
          </React.Fragment>
        )}
      </Box>

      {open ? (
          success ? (
            <PopupSingleButton
              title={popupTitle}
              text={popupText}
              button_text={"Close"}
              button_listener={() => 
              {
                if(logout)
                  Logout();
                else
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

    </div>
  );
}
