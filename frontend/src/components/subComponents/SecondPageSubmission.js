import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

export default function SecondPageSubmission({  articleTitle, setArticleTitle, abstract, setAbstract, submissionType, setSubmissionType, acknowledgements, setAcknowledgements }) {
  const [error, setError] = React.useState('');

  const handleAbstractChange = (event) => {
    const newText = event.target.value;
    const wordCount = newText.split(/\s+/).filter(Boolean).length;
    if (wordCount <= 250) {
      setAbstract(newText);
      setError('');
    } else {
      setError('Abstract cannot exceed 250 words');
    }
  };

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          '& > :not(style)': { m: 1 },
        }}
        style={{ paddingTop: "2rem", paddingBottom: "1rem" }}
      >
        <FormControl fullWidth>
          <InputLabel>Type of Submission</InputLabel>
          <Select
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value)}
            label="Type of Submission"
            required
          >
            <MenuItem value="Research">Research Article</MenuItem>
            <MenuItem value="Review">Review Article</MenuItem>
            <MenuItem value="Short">Short Communication</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="article-title"
          label="Title of Paper"
          value={articleTitle}
          onChange={(e) => setArticleTitle(e.target.value)}
          required
          fullWidth
        />
        <TextField
          id="abstract"
          label="Abstract"
          value={abstract}
          onChange={handleAbstractChange}
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          helperText={error || `${abstract.split(/\s+/).filter(Boolean).length} / 250 words`}
          error={!!error}
          required
        />
        <TextField
          id="acknowledgements"
          label="Acknowledgements/Funding Information"
          value={acknowledgements}
          onChange={(e) => setAcknowledgements(e.target.value)}
          multiline
          rows={2}
          variant="outlined"
          fullWidth
          required
        />
        
      </Box>
    </div>
  );
}
