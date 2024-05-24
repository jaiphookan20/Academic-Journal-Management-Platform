module.exports = (app) => 
{
  const ReviewController = require("../controllers/review.controller.js");

  var router = require("express").Router();

  const { authorize,authorize_role } = require("../utilities/authorize.js");

  router.post("/assign-reviewer", authorize_role(["Editor"]), ReviewController.assignReviewer); 

  router.post("/submit-review", authorize_role(["Reviewer"]), ReviewController.submitReviewByReviewer);
  
  /* Get Submissions Accepted by the Reviewer to Review, not Submissions that the reviewer has provided an outcome recommendation of accept */
  router.get("/get-accepted-submissions", authorize_role(["Reviewer"]), ReviewController.getAcceptedSubmissionsForReview);

  router.post("/accept-review-request", authorize_role(["Reviewer"]), ReviewController.acceptReviewRequest);

  router.post("/decline-review-request", authorize_role(["Reviewer"]), ReviewController.declineReviewRequest);
  
  router.get("/get-unconfirmed-reviews", authorize_role(["Reviewer"]), ReviewController.getUnconfirmedReviews);

  // Get Completed Reviews for a Reviewer
  router.get("/get-completed-reviews",authorize_role(["Reviewer"]), ReviewController.getCompletedReviews);

  // Create a manuscript inline comment
  router.post("/add-inline-comment/:submission_id",authorize_role(["Reviewer"]), ReviewController.addInlineComment);

  // Get all manuscript comments for a submission
  router.get("/get-inline-comments/:submission_id/:is_review",authorize(), ReviewController.getInlineComments);

  // Delete an inline comment
  router.delete("/delete-inline-comment/:submission_id",authorize_role(["Reviewer"]), ReviewController.deleteInlineComment);

  // Toggle author visibility for an inline comment
  router.post("/change-visibility-inline-comment/:submission_id",authorize_role(["Editor"]), ReviewController.changeVisibilityInlineComment);

  app.use("/review", router);
};
  

