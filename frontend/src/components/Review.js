import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FirstPage from './subComponents/FirstPageReviewer';
import SecondPage from './subComponents/SecondPageReviewer';
import ThirdPage from './subComponents/ThirdPageReviewer';
import FourthPage from './subComponents/FourthPageReviewer';
import "./Css/Form.css";
import { useLocation } from 'react-router-dom';

const steps = ['Details', 'Guidelines', 'Recommendation', 'Comments'];

export default function Review() {
  
  const [activeStep, setActiveStep] = React.useState(0);
  const [readGuidelines, setReadGuidelines] = React.useState(false);
  const [recommendationSelected, setRecommendationSelected] = React.useState(false);
  const [detailsFilled, setDetailsFilled] = React.useState(false);
  const [commentsFilled, setCommentsFilled] = React.useState(false);

  
  const location = useLocation();
  const articleTitleName = location.state?.articleTitle;
   /* eslint-disable */
  

  const handleDetailsChange = (name, contact, title) => {
    setDetailsFilled(name && contact && title);
  };

  const handleCommentsChange = (editorsComment, authorsComment) => {
    setCommentsFilled(editorsComment && authorsComment);
  };

  const handleNext = () => {

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleRadioChange = (event) => {
    setReadGuidelines(event.target.value === 'yes');
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleRecommendationChange = (value) => {
    setRecommendationSelected(!!value);
  };

  return (
    <div className='container-form' style={{padding: '20px', paddingTop: '5rem'}}>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel >{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length ? (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              <h3 style={{color: '#6f141b', paddingTop:'3rem'}}><b>Your review has been submitted.</b></h3>
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset} variant="contained" sx={{backgroundColor: "#b25259"}}>Home</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {activeStep === 0 && <FirstPage onDetailsChange={handleDetailsChange} articleTitle={articleTitleName}/>}
            {activeStep ===1 && <SecondPage onRadioChange={handleRadioChange}/>}
            {activeStep === 2 && <ThirdPage onRecommendationChange={handleRecommendationChange} />}
            {activeStep === 3 && <FourthPage onCommentsChange={handleCommentsChange} />}
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
                onClick={handleNext} 
                sx={{backgroundColor: "#b25259"}}
                disabled={
                  (activeStep === 0 && !detailsFilled) ||
                  (activeStep === 1 && !readGuidelines) ||
                  (activeStep === 2 && !recommendationSelected) ||
                  (activeStep === steps.length - 1 && !commentsFilled)
                }
                variant="contained">
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </React.Fragment>
        )}
      </Box>
    </div>
  );
}
