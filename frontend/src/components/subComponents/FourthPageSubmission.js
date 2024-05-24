import React, { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

function FourthPageSubmission({ onConflictInterestChange }) {
  const [conflictInterest, setConflictInterest] = useState(false);
  const [conflictDetail, setConflictDetail] = useState('');

  const handleRadioChange = (event) => {
    let change = null
    if(event.target.value === "yes")
      change = true
    else
      change = false
    setConflictInterest(change);
    onConflictInterestChange(change, conflictDetail);
  };

  const handleDetailChange = (event) => {
    setConflictDetail(event.target.value);
    onConflictInterestChange(conflictInterest, event.target.value);
  };

  return (
    <div style={{ paddingTop: "3rem" }}>
      <h3 style={{color: '#6f141b'}}>Conflict of Interest Declaration</h3>
      <FormControl component="fieldset" sx={{ mt: 2 }} fullWidth>
        <RadioGroup
        name="options"
        onChange={handleRadioChange}
        value={conflictInterest ? "yes" : "no"}
        row
      >
        <FormControlLabel value="yes" control={<Radio />} label="Yes, I have a conflict of Interest" />
        <FormControlLabel value="no" control={<Radio />} label="No, I don't have a conflict of Interest" />
      </RadioGroup>
        {conflictInterest && (
          <Box mt={3}>
            <TextField
              fullWidth
              label="Please specify the conflict of interest"
              multiline
              rows={4}
              variant="outlined"
              value={conflictDetail}
              onChange={handleDetailChange}
            />
          </Box>
        )}
      </FormControl>
    </div>
  );
}

export default FourthPageSubmission;
