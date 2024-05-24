import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const recommendations = [
  'Accept',
  'Accept with minor revisions',
  'Revise & Submit',
  'Reject',
];

export default function ThirdPageReviewer({ onRecommendationChange }) {
  const theme = useTheme();
  const [recommendationResult, setRecommendationResult] = React.useState('');
  const [willingToReview, setWillingToReview] = React.useState('no');

  const handleChange = (event) => {
    setRecommendationResult(event.target.value);
    onRecommendationChange(event.target.value);
  };

  const handleRadioChange = (event) => {
    setWillingToReview(event.target.value);
  };


  return (
    <div style={{ paddingTop: "3rem" }}>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-simple-select-label">Recommendation</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={recommendationResult}
          onChange={handleChange}
          input={<OutlinedInput label="Recommendation" />}
          MenuProps={MenuProps}
        >
          {recommendations.map((recommendation) => (
            <MenuItem
              key={recommendation}
              value={recommendation}
              style={{
                fontWeight: recommendation === recommendationResult
                  ? theme.typography.fontWeightMedium
                  : theme.typography.fontWeightRegular,
              }}
            >
              {recommendation}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <h3 style={{color: '#6f141b', paddingTop:"2rem"}}>Recommendation</h3>
      <ol>
        <li><b>Accept</b> <em>– this article is suitable for publication.</em></li>
        <li><b>Accept with minor revisions</b> <em>– this article is suitable for publication in its present form, provided that minor corrections or revisions are made as specified in the 
              comments below.</em></li>
        <li><b>Revise & resubmit</b> <em>– this article is potentially suitable for publication, but requires considerable revision as specified in the comments below.</em></li>
        <li><b>Reject</b> <em>– this article is not recommended for publication.</em></li>
      </ol>
      
      {recommendationResult === 'Revise & Submit' && (
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">Would you be willing to review a revision of this manuscript?</FormLabel>
          <RadioGroup
            row
            aria-label="willing-to-review"
            name="willingToReview"
            value={willingToReview}
            onChange={handleRadioChange}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      )}
    </div>
  );
}
