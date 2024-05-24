import * as React from 'react';
import { Box, TextField, Button, Grid, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export default function FirstPageSubmission({ authors, setAuthors }) {

  const handleAuthorChange = (index, field) => (event) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = event.target.value;
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, { firstName: '', lastName: '', affiliation: '', academicTitle: '', orcid: ''}]);
  };

  const removeAuthor = (index) => {
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);
    setAuthors(newAuthors);
  };

  return (
    <div>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
        {authors.map((author, index) => (
          <Grid container spacing={2} key={index}>
            <Grid item xs={12}>
              <p><b>Author Information</b></p>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="First Name" value={author.firstName} onChange={handleAuthorChange(index, 'firstName')}  disabled={index===0} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Last Name" value={author.lastName} onChange={handleAuthorChange(index, 'lastName')} disabled={index===0}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Academic Title" value={author.academicTitle} onChange={handleAuthorChange(index, 'academicTitle')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="ORCID" value={author.orcid} onChange={handleAuthorChange(index, 'orcid')} disabled={index===0}/>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required label="Affiliation" value={author.affiliation} onChange={handleAuthorChange(index, 'affiliation')} disabled={index===0}/>
            </Grid>

            {(authors.length > 1 && index >= 1)? (
              <Grid item>
                <IconButton onClick={() => removeAuthor(index)}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Grid>
            ):<Grid item></Grid>}
          </Grid>
        ))}
        <Button startIcon={<AddCircleOutlineIcon />} onClick={addAuthor}>Add Author</Button>
      </Box>
    </div>
  );
}
