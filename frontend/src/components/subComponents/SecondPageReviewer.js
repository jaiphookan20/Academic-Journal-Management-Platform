import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';

export default function SecondPageReviewer({ onRadioChange }) {
  return (
    <div style={{ paddingTop: "3rem" }}>
      <h3 style={{color: '#6f141b'}}>Reviewing Guidelines</h3>
      <p style={{ paddingTop: "1rem" }}>Reviewers are asked to make a recommendation on a paper using one of four categories 
        (<b>accept, accept with revisions, revise and resubmit, reject</b>).</p>
      <p>As you write your review, please keep the following issues in mind:</p>
        <ul>
          <li>The relevance of the topic to the Language Testing field</li>
          <li>The originality of the contribution</li>
          <li>The logic and clarity of the argument</li>
          <li>The soundness of the research design</li>
          <li>The extent to which conclusions are justified</li>
          <li>The clarity and quality of writing</li>
        </ul>
      <p>  If you have any questions about the review process, please email the Editorial Assistant, Annemiek Huisman, at <a href="mailto:sila.editors@gmail.com">sila.editors@gmail.com</a>.
      </p>
      <FormControl component="fieldset"  sx={{ mt: 2 }}>
        <FormLabel component="legend">Have you read the guidelines?</FormLabel>
        <RadioGroup
          row
          name="read-guidelines-group"
          onChange={onRadioChange}
        >
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl>
    </div>
  );
}