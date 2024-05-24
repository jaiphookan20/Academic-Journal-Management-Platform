import React, { useState } from 'react';
import '../Css/ContactAuthor.css';
import { useLocation, useNavigate } from 'react-router-dom';

const messageTemplates = {
    accepted: "Dear [Author Name],\n\nWe are pleased to inform you that your manuscript titled [Manuscript Title] has been accepted for publication. Congratulations!",
    deskReject: "Dear [Author Name],\n\nAfter careful consideration, we have decided not to proceed with the review process for your manuscript titled [Manuscript Title].",
    rejected: "Dear [Author Name],\n\nWe regret to inform you that after careful consideration, we have decided not to accept your manuscript titled [Manuscript Title] for publication.",
    changesNeeded: "Dear [Author Name],\n\nYour manuscript titled [Manuscript Title] requires the following changes before it can be considered for publication..."
  };

export default function ContactAuthor() {
    const location = useLocation();
    const navigate = useNavigate();

    const authorName = location.state?.authorName || '[Author Name]';
    const articleTitle = location.state?.articleTitle || '[Article Title]';
    const authorNameEmail = authorName.replace(/\s+/g, ' ').trim();
    const authorEmail = authorNameEmail.split(' ').join('').toLowerCase() + '@gmail.com';
  
    const [email, setEmail] = useState(authorEmail);
    const [subject, setSubject] = useState(`Regarding ${articleTitle}`);
    const [message, setMessage] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleTemplateChange = (event) => {
    const templateKey = event.target.value;
    setSelectedTemplate(templateKey);
    const templateMessage = messageTemplates[templateKey]
      .replace('[Author Name]', authorName)
      .replace('[Manuscript Title]', articleTitle);
    if (templateKey) {
      setMessage(templateMessage);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`Sending email to: ${email}, Subject: ${subject}, Message: ${message}`);
    navigate('/editor-dashboard');
  };

// const handleSubmit = async (event) => {
//     event.preventDefault();
    
//     try {
//       const response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/send-email`, { // Use your server's address
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           to: email,
//           subject: subject,
//           message: message,
//         }),
//       });
  
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
       
//       console.log('Email sent successfully!');
//       navigate('/editor-dashboard');
//     } catch (error) {
//       console.error('Sending email failed:', error);
//     }
//   };

  return (
    <div className="contact-author-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="to">To</label>
          <input
            type="email"
            id="to"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
            <label htmlFor="message-template">Message Template</label>
            <select
                id="message-template"
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="select"
            >
                <option value="">Select a template</option>
                <option value="accepted">Accepted</option>
                <option value="deskReject">Desk Reject</option>
                <option value="rejected">Rejected</option>
                <option value="changesNeeded">Changes Needed</option>
            </select>
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
