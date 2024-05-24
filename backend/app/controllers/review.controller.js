const { Review,Manuscript_Comment } = require("../services/review.service.js");

exports.assignReviewer = async (req, res) => {
    const submissionId = req.body.submissionId;
    const editorId = res.locals.client_id;
    const reviewerId = req.body.reviewerId;
    let targetDate = req.body.targetDate;
  
    if (submissionId == "" || reviewerId == "" || targetDate == "" ) {
      return res.status(400).json({ error: "Submission ID, Reviewer ID and Target Date are mandatory" });
    }
  
    if (submissionId == undefined || reviewerId == undefined || targetDate == undefined) {
      return res.status(400).json({ error: "Invalid Submission ID, Reviewer ID or Target Date" });
    }

    // Validate and convert the target date string to a Date object
    targetDate = new Date(targetDate);
    
    if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ error: "Invalid Target Date format" });
    }
  
    try {
        const result = await Review.assignReviewer(submissionId, reviewerId, editorId, targetDate, (err,result) => {
          if (err) {
            console.log(`${err}`);
            const message = err || "Some error occurred while adding a new reviewer for a submission";
            return res.status(400).json({ error: message });
        } else {
            return res.status(200).json({ message: `Reviewer with ID ${reviewerId} successfully assigned to submission with ID ${submissionId}` });
        }
      });
    } catch (err) {
      const message = err.message || "Some error occurred while trying to assign a new reviewer for a submission";
      return res.status(500).json({ error: message });
    }
};

exports.submitReviewByReviewer = async (req, res) => {
    const submissionId = req.body.submissionId;
    const reviewerId = res.locals.client_id;
    const outcomeRecommendation = req.body.outcomeRecommendation;
    const reviewCommentsEditor = req.body.reviewCommentsEditor;
    const reviewCommentsAuthor = req.body.reviewCommentsAuthor;
    const revisionReview = req.body.revisionReview;

    if (!Number.isInteger(outcomeRecommendation)) {
      return res.status(400).json({ error: "Please provide a valid value for the Outcome Recommendation" });
    }

    if (submissionId == "" || outcomeRecommendation == "" || reviewCommentsEditor == "" || reviewCommentsAuthor == "" || revisionReview == "") {
      return res.status(400).json({ error: "Submission ID, outcomeRecommendation, reviewCommentsEditor, and reviewCommentsAuthor are mandatory" });
    }
  
    if (submissionId == undefined || reviewerId == undefined || outcomeRecommendation == undefined || reviewCommentsEditor == undefined || reviewCommentsAuthor == undefined || revisionReview == "") {
      return res.status(400).json({ error: "Invalid Submission ID, Reviewer ID, outcomeRecommendation, reviewCommentsEditor, or reviewCommentsAuthor" });
    }
  
    try {
      console.log('Inside submitFunc');  
      const result = await Review.submitReviewByReviewer(submissionId, reviewerId, outcomeRecommendation, reviewCommentsEditor, reviewCommentsAuthor, revisionReview, (err,result) => {
        if (err) {
          const message = err || "Some error occurred while submitting your review";
          return res.status(400).json({ error: message });
        } else {
            return res.status(200).json({ message: `Review for submission: ${submissionId} successfully submitted` });
        }
      });
    } catch (err) {
      const message = err.message || "Some error occurred while submitting a review by the Reviewer for the provided submission";
      return res.status(500).json({ error: message });
    }
};
exports.getAcceptedSubmissionsForReview = async (req, res) => {
  const reviewerId = res.locals.client_id;

  console.log('Inside getAccepted');

  const result = await Review.getAcceptedSubmissionsForReview(reviewerId, (err,result) => {
    if (err) 
    {
      const message = err || "Some error occurred while trying to retrieve submissions accepted for review";
      return res.status(400).json({ error: message });
    } 

    else {
      return res.status(200).send(result);
    }
  });
}

exports.acceptReviewRequest = async (req, res) => {
  const reviewerId = res.locals.client_id;
  const reviewId = req.body.reviewId;

  if (reviewId == "" || reviewId == undefined) {
    return res.status(400).json({ error: "Review ID is mandatory in the body" });
  }

  const result = await Review.acceptReviewRequest(reviewId, reviewerId, (err,result) => {
    if (err) 
    {
      const message = err || "Some error occurred while trying to accept the review request";
      return res.status(400).json({ error: message });
    } 
    else 
    {
      return res.status(200).json({message:result});
    }
  });
}

exports.declineReviewRequest = async (req, res) => 
{
  const reviewerId = res.locals.client_id;
  const reviewId = req.body.reviewId;

  if (reviewId == "" || reviewId == undefined) 
    {
    return res.status(400).json({ error: "Review ID is mandatory in the body" });
  }

  const result = await Review.declineReviewRequest(reviewId, reviewerId, (err,result) => {
    if (err) 
    {
      const message = err || "Some error occurred while trying to decline the review request";
      return res.status(400).json({ error: message });
    } 
    else 
    {
      return res.status(200).json({message:result});
    }
  });
}

exports.getUnconfirmedReviews = async (req, res) => {
  const reviewer_id = res.locals.client_id;

  const result = await Review.getUnconfirmedReviews(reviewer_id, (err,result) => {
    if (err) 
    {
      const message = err || "Some error occurred while retrieving your unconfirmed reviews";
      return res.status(400).json({ error: message });
    } 

    else {
      return res.status(200).send(result);
    }
  });
}

exports.getCompletedReviews = async (req, res) => {
  const reviewer_id = res.locals.client_id;

  const result = await Review.getCompletedReviews(reviewer_id, (err,result) => {
    if (err) 
    {
      const message = err || "Some error occurred while retrieving your completed reviews";
      return res.status(400).json({ error: message });
    } 
    
    else {
      return res.status(200).send(result);
    }
  });
}

exports.addInlineComment = async (req, res) => 
{
  const submission_id = req.params.submission_id;
  const comments = JSON.stringify(req.body);
  const client_id = res.locals.client_id;

  // Check if the request body is empty 
  if (!req.body) 
  {
    return res.status(400).json({ error: "Content cannot be empty." });
  }

  if(!req.params.submission_id || req.params.submission_id == '') 
  {
    return res.status(400).json({'error':'Submission id is mandatory in params'});
  }

  const new_comment = new Manuscript_Comment({
    comments: comments,
    commented_by: client_id
  });

  Manuscript_Comment.create(new_comment,submission_id,(err,result) => 
  {
    if (err) 
    {
      console.log(err)
      const message =
        err || "Some error occurred while trying to add comment.";
      res.status(400).json({ error: message });
      return;
    } 
    else 
    {
      res.status(200).send(result);
    }
  });
}

exports.getInlineComments = async (req, res) => 
{
  const submission_id = req.params.submission_id;
  const client_id = res.locals.client_id;
  const is_review = req.params.is_review;

  if(!req.params.submission_id || req.params.submission_id == '') 
  {
    return res.status(400).json({'error':'Submission id is mandatory in params'});
  }

  if(!req.params.is_review == 'true' || !req.params.is_review == 'false') 
  {
    return res.status(400).json({'error':'Enter false for view mode and true for review mode as second parameter'});
  }

  Manuscript_Comment.getInlineComments(client_id,submission_id,is_review,(err,result) => 
  {
    if (err) 
    {
      console.log(err)
      const message =
        err || "Some error occurred while trying to get all comments.";
      res.status(400).json({ error: message });
      return;
    } 
    else 
    {
      res.status(200).send(result);
    }
  });
}

exports.deleteInlineComment = async (req, res) => 
  {
    const submission_id = req.params.submission_id;
    const comment_id  = req.body.comment_id;
    const client_id = res.locals.client_id;
  
    if(!req.params.submission_id || req.params.submission_id == '') 
    {
      return res.status(400).json({'error':'Submission id is mandatory in params'});
    }

    if(!req.body.comment_id || req.body.comment_id == '')
    {
      return res.status(400).json({'error':'Comment id field is mandatory in the body'});
    }
  
    Manuscript_Comment.deleteInlineComment(submission_id,comment_id,client_id,(err,result) => 
    {
      if (err) 
      {
        console.log(err)
        const message =
          err || "Some error occurred while trying to delete comment.";
        res.status(400).json({ error: message });
        return;
      } 
      else 
      {
        res.status(200).json({"message":result});
      }
    });
}

exports.changeVisibilityInlineComment = async (req, res) => 
{
  const submission_id = req.params.submission_id;
  const comment_id  = req.body.comment_id;
  const client_id = res.locals.client_id;
  const visible_to_author = req.body.visible_to_author;


  if( typeof visible_to_author != "boolean") 
  {
    return res.status(400).json({'error':'visible_to_author boolean is mandatory in the body'});
  }

  if(!req.params.submission_id || req.params.submission_id == '') 
  {
    return res.status(400).json({'error':'Submission id is mandatory in params'});
  }

  if(!req.body.comment_id || req.body.comment_id == '')
  {
    return res.status(400).json({'error':'Comment id field is mandatory in the body'});
  }

  Manuscript_Comment.changeVisibilityInlineComment(submission_id,comment_id,client_id,visible_to_author,(err,result) => 
  {
    if (err) 
    {
      console.log(err)
      const message =
        err || "Some error occurred while trying to change visibility.";
      res.status(400).json({ error: message });
      return;
    } 
    else 
    {
      res.status(200).json({"message":result});
    }
  });
}

