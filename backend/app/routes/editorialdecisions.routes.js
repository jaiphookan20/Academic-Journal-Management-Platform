module.exports = (app) => 
{
const {getAllUnassignedSubmissions, assignSubmissionsToEditor, reassignSubmissionByEditor, updateSubmissionOutcome, getAllCompletedSubmissions, getAllCurrentSubmissions,getReviewsForSubmission} = require("../controllers/editorialdecisions.controller.js");

  var router = require("express").Router();

  const { authorize_role } = require("../utilities/authorize.js");

  // Get All Unassigned Manuscripts
  router.get("/get-all-unassigned-submissions",authorize_role(["Editorial Assistant"]), getAllUnassignedSubmissions);

  // Get All Complete Manuscript Submissions assiged to Editor 
  router.get("/get-all-completed-submissions",authorize_role(["Editor"]), getAllCompletedSubmissions);

  // Get All Incomplete/Current Manuscript Submissions assiged to Editor 
  router.get("/get-all-current-submissions",authorize_role(["Editor"]), getAllCurrentSubmissions);

  // Assign Unassigned Manuscript to Editor
  router.post("/assign-submission",authorize_role(["Editorial Assistant"]), assignSubmissionsToEditor);

  // Get all reviews for a submission
  router.get("/get-all-reviews-of-submission/:submission_id",authorize_role(["Editor"]), getReviewsForSubmission);

  // Reassign a submission, done by an author
  router.post("/reassign-submission",authorize_role(["Editor"]), reassignSubmissionByEditor);

  // Update Submission Outcome by Editor (This updates the status to 'Outcome Published')
  router.post("/update-outcome",authorize_role(["Editor"]), updateSubmissionOutcome);
  
  app.use("/editorial-decisions", router);
};
