import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function FirstPageReviewer({ onDetailsChange, articleTitle }) {
  const [reviewersName, setReviewersName] = React.useState('');
  const [reviewersContact, setReviewersContact] = React.useState('');
  const [articleTitleState, setArticleTitleState] = React.useState(articleTitle);

  React.useEffect(() => {
    onDetailsChange(reviewersName, reviewersContact, articleTitleState);
  }, [reviewersName, reviewersContact, articleTitleState, onDetailsChange]);

  React.useEffect(() => {
    if (articleTitle) {
      setArticleTitleState(articleTitle);
    }
  }, [articleTitle]);

  return (
    <div style={{paddingTop:"3rem"}}>
      <h3 style={{color: '#6f141b', paddingTop:"2rem"}}>Information for reviewers</h3>
      <p style={{textAlign: 'justify'}}>
      <em>Studies in Language Assessment (SiLA)</em> is the international peer-reviewed research journal of the Association for Language Testing and Assessment of Australia and New Zealand 
      (<a href="https://www.shecodes.io/">ALTAANZ</a>). 
      It previously appeared under the title <em>Papers in Language Testing and Assessment (PLTA)</em>. 
      The journal is an online, open-access publication that welcomes contributions from both new and experienced researchers in the form of full research articles, research reports and discussion papers, on topics in the field of language assessment. 
      It also publishes commissioned book and test reviews. Currently, there are at least one regular issue and one theme-based special issue each year. 
      SiLA is included in the Web of Science Emerging Sources Citation Index (ESCI).
      </p>
      <p>
      <em>SiLA</em> is available exclusively online at <a href="https://www.shecodes.io/">ALTAANZ</a> and the <a href='https://arts.unimelb.edu.au/language-testing-research-centre/research/publications'>Language Testing Research Centre</a>.
      </p>

      <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        '& > :not(style)': { m: 1, width: '100%' },
      }}
      style={{paddingTop:"2rem", paddingBottom: "1rem"}}
      >
        <TextField
          id="article-title"
          label="Article title"
          value={articleTitleState}
          onChange={(e) => setArticleTitleState(e.target.value)}
        />
        <TextField
        id="reviewers-name"
        label="Reviewer’s name"
        value={reviewersName}
        onChange={(e) => setReviewersName(e.target.value)}
        />
        <TextField
          id="reviewers-contact"
          label="Reviewer’s contact details"
          value={reviewersContact}
          onChange={(e) => setReviewersContact(e.target.value)}
        />

      </Box>
  </div>
  );
}