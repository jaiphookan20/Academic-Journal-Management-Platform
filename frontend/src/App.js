import "./App.css";
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import About from "./components/About";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Submission from "./components/ManuscriptSubmission";
import Review from "./components/Review";
import ForgotPassword from "./components/ForgotPassword";
import PasswordReset from "./components/PasswordReset";
import EditAccount from "./components/EditAccount";
import Editemail from "./components/Editemail";
import Editpassword from "./components/Editpassword";
import ReviewerForm from "./components/ReviewerForm";
import Authordashboard from "./components/Authordashboard";
import ProfilePage from "./components/ProfilePage";
import EditorSubmissionBoard from "./components/EditorSubmissionBoard";
import EditorialAssistantDashboard from "./components/EditorialAssistantDashboard";
import EditorDashboard from "./components/Editordashboard";
import ContactAuthor from "./components/subComponents/ContactAuthor";
import PdfReviewer from "./components/PdfReviewer";
import PdfViewer from "./components/PdfViewer"; 
import Reviewerdashboard from "./components/Reviewerdashboard";
import ReviewerCompletedDashboard from "./components/ReviewerCompletedDashboard";
import EditorSignUp from "./components/EditorCreateAccount";
import SubmissionPage from "./components/SubmissionView";
import EditorInProgressDashboardSubmissions from "./components/EditorInProgressDashboardSubmissions";
import CompletedReview from "./components/ReviewerCompletedDashboard";
import ReviewerManageRequest from "./components/ReviewerManageRequest";
import EditorCompletedReviewsDashboard from "./components/EditorCompletedReviewsDashboard";
import PageNotFound from "./components/PageNotFound";
import AssignRolesDashboard from "./components/AssignRoles";


function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route exact path="/about" element={<About/>} />
          <Route exact path="/submission" element={<Submission/>} />
          <Route exact path="/review" element={<Review/>} />
          <Route exact path="/signup" element={<Signup/>} />
          <Route exact path="/Login" element={<Login/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>}  />
          <Route path="/reset-password/:token" element={<PasswordReset/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/edit-account-details" element={<EditAccount/>} />
          <Route path="/edit-email" element={<Editemail/>} />
          <Route path="/edit-credentials" element={<Editpassword/>} />
          <Route path="/review-form" element={<ReviewerForm/>} />
          <Route path="/author-dashboard" element={<Authordashboard/>} />
          <Route path="/editorial-assistant-dashboard" element={<EditorialAssistantDashboard/>} />
          <Route path="/editor-dashboard" element={<EditorDashboard/>} />
          <Route path="/reviewer-dashboard" element={<Reviewerdashboard/>} />
          <Route path="/reviewer-completed" element={<ReviewerCompletedDashboard/>} />
          <Route path='/profile' element={<ProfilePage/>} />
          <Route path="/editor-submission-board" element={<EditorSubmissionBoard/>} />
          <Route path="/contact-author" element={<ContactAuthor/>}/>
          <Route path="/pdf-reviewer" element={<PdfReviewer/>}/>
          <Route path="/pdf-viewer" element={<PdfViewer/>}/>
          <Route path="/completed-reviews" element={<CompletedReview/>}/>
          <Route path="/review-request" element={<ReviewerManageRequest/>}/>
          <Route path="/editor-in-progress-submissions" element={<EditorInProgressDashboardSubmissions/>} />
          <Route path="/editor-review-completed-submissions" element={<EditorCompletedReviewsDashboard/>} />
          <Route path="/EditorSignUp" element={<EditorSignUp/>} />
          <Route path="/Submission-Paper" element={<SubmissionPage/>} />
          <Route path="/pdf-viewer" element={<PdfViewer/>} />
          <Route path="/pdf-reviewer" element={<PdfReviewer/>} />
          <Route path="/assign-roles" element={<AssignRolesDashboard/>} />
          {/* temp delete this */}
          <Route path="/paths" element={<Footer/>} />

          <Route path="/PageDoesNotExist" element={<PageNotFound/>} />
          <Route path="*" element={<Navigate to="/PageDoesNotExist" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
