import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function FourthPageReviewer({ onCommentsChange }) {
  const [commentsToEditors, setCommentsToEditors] = React.useState('');
  const [commentsToAuthors, setCommentsToAuthors] = React.useState('');

  React.useEffect(() => {
    onCommentsChange(commentsToEditors, commentsToAuthors);
  }, [commentsToEditors, commentsToAuthors, onCommentsChange]);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        '& > :not(style)': { m: 1, width: '60vw' },
      }}
      style={{paddingTop:"3rem"}}
    >
      <TextField
      id="comments-to-editors"
      label="Comments to the Editors (confidential)"
      multiline
      rows={4}
      variant="outlined"
      fullWidth
      value={commentsToEditors}
      onChange={(e) => setCommentsToEditors(e.target.value)}
      />

      <TextField
        id="comments-to-authors"
        label="Comments to the Author(s)"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={commentsToAuthors}
        onChange={(e) => setCommentsToAuthors(e.target.value)}
      />
    </Box>
  );
}