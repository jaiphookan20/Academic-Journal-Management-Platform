import { Link } from "react-router-dom";

function Footer() {
    return (
      <footer>
        <p>Some links  might not work as expected since you are supposed to be logged in to use these functions. For better testing please register and Login.</p>
        <h3>Paths in the Codebase:</h3>
        <ul>
          <li><Link to="/">Home </Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/submission">Submission</Link></li>
          <li><Link to="/review">Review</Link></li>
          <li><Link to="/signup">Sign Up</Link></li>
          <li><Link to="/Login">Login</Link></li>
          <li><Link to="/forgot-password">Forgot Password</Link></li>
          <li><Link to="/edit-account-details">Edit Account Details</Link></li>
          <li><Link to="/edit-email">Edit Email</Link></li>
          <li><Link to="/edit-credentials">Edit Credentials</Link></li>
          <li><Link to="/review-form">Review Form</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/author-dashboard">Author Dashboard</Link></li>
          <li><Link to="/editor-dashboard">Editor Dashboard</Link></li>
          <li><Link to="/editor-submission-board">Editor Submission Dashboard</Link></li>
          <li><Link to="/editorial-assistant-dashboard">Editorial Assistant Dashboard</Link></li>
          <li><Link to="/reviewer-dashboard">Reviewer Dashboard</Link></li>
          <li><Link to="/contact-author">Contact Author</Link></li>
          <li><Link to="/EditorSignUp">Editor Sign Up</Link></li>
          <li><Link to="/completed-reviews">Reviewer completed Dashboard</Link></li>
          <li><Link to="/review-request">Reviewer Review Request Dashboard</Link></li>
          <li><Link to="/editor-in-progress-submissions">Editor View In Progress Submissions</Link></li>
          <li><Link to="/editor-review-completed-submissions">Editor Review Completed Submissions</Link></li>
          <li><Link to="/Submission-Paper">Submission Paper</Link></li>
          <li><Link to="/assign-roles">Assign Roles</Link></li>
        </ul> 
      </footer>
    );
  };
  
export default Footer;

