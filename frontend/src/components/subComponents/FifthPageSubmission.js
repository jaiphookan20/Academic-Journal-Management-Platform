import React from 'react';
import '../Css/FifthPageSubmission.css';

export default function FifthPageSubmission({ articleTitle, abstract, submissionType, acknowledgements, authors, conflictInterest, conflictDetail }) {
  return (
    <div className="container-fifthpage">
      <h2 className="heading">Submission Summary</h2>
      <div className="summary">
        <p><span className="detail">Title:</span> {articleTitle}</p>
        <p style={{textAlign:'justify'}}><span className="detail">Abstract:</span> {abstract}</p>
        <p><span className="detail">Type of Submission:</span> {submissionType}</p>
        <p><span className="detail">Acknowledgements:</span> {acknowledgements}</p>
      </div>
      
      <h3 className="heading">Authors</h3>
      {authors.map((author, index) => (
        <div key={index} className="author-card">
          <p><span className="detail">First Name:</span> {author.firstName}</p>
          <p><span className="detail">Last Name:</span> {author.lastName}</p>
          <p><span className="detail">Affiliation:</span> {author.affiliation}</p>
          <p><span className="detail">Academic Title:</span> {author.academicTitle}</p>
          <p><span className="detail">ORCID:</span> {author.orcid}</p>
        </div>
      ))}

      <div className="conflict-section">
        <p><span className="detail">Conflict of Interest:</span> {conflictInterest ? 'Yes' : 'No'}</p>
        {conflictInterest && <p><span className="detail">Details:</span> {conflictDetail}</p>}
      </div>
    </div>
  );
}
