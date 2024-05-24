
const {Submission_Model,File_Model} = require('../models/submission.model.js');
const {Manuscript_Comment_Model, Review_Model, Outcome_Model} = require('../models/review.model.js');
const { Client_Model, Client_Role_Model } = require('../models/client.model.js');
const { send_email, getIcalObjectInstance } = require('../utilities/email.js');
const sequelize = require("../models/db.js");
const { QueryTypes,Op } = require("sequelize");


// #region Object constructors
class Review
{

}

const Manuscript_Comment = function (manuscript_comment) 
{
  this.comments = manuscript_comment.comments;
  this.commented_by = manuscript_comment.commented_by;
};
// #endregion

Review.assignReviewer = async (submissionId, reviewerId, editorId, targetDate, result) => {
    try {

        /* Find the submission with the provided submissionId */
        const submission = await Submission_Model.findOne({
            where: { submission_id: submissionId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        /* If no submission found, return an error */
        if (!submission) {
            result(`No Submission exists with the submissionId: ${submissionId}`, null);
            return;
        }
        
        const editor = await Client_Model.findOne({
            where: { client_id: submission.editor_id },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });
        
        if (submission.editor_id != editorId) {
            if (!submission.editor_id)  {
                result(`You are not the autorized Editor to assign a Reviewer for this submission. `, null);        
            }
            else {
                result(`You are not the autorized Editor to assign a Reviewer for this submission; Editor ${editor.first_name} ${editor.last_name} is the authorized Editor`, null);
            }
            return;
        }
        
        const reviewer = await Client_Model.findOne({
            where: { client_id: reviewerId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });
        
        if (!reviewer) {
            result(`Invalid Reviewer provied with ID: ${reviewerId}`, null);
            return;
        }
        
        const reviewer_role = await Client_Role_Model.findOne({
            where: {role_id: 4, client_id: reviewerId},
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        })

        if (!reviewer_role) {
            result(`Person assigned: ${reviewer.first_name} ${reviewer.last_name} is not a valid Reviewer`, null);
            return;
        }

        const existingReviewAccepted = await Review_Model.findOne({
          where: {reviewer_id: reviewerId, submission_id: submissionId, confirm_to_editor: 1},
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        })

        const existingReviewPending = await Review_Model.findOne({
          where: {reviewer_id: reviewerId, submission_id: submissionId, confirm_to_editor: {[Op.is]:null}},
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        })

        if (existingReviewPending) 
          return result(`Reviewer has already been requested to review this submission`, null);
        if (existingReviewAccepted) 
          return result(`Reviewer is already reviewing this submission`, null);


        const review = await Review_Model.create({
            submission_id: submissionId,
            reviewer_id: reviewerId,
            target_date: targetDate
        });

        const emailSubject = "Submission Assigned for Review";
        const emailHTML = `<p> Hi ${reviewer.first_name} ${reviewer.last_name}, <br/> You have been assigned as the reviewer for the Submission Title: ${submission.submission_title}.  <br/> Please log in to the peer review platform to access it. </p>`;
        const recipientEmail = reviewer.email;
        console.log("recipientEmail: " + recipientEmail);

        send_email(recipientEmail, emailSubject, emailHTML);

        result(null, `Reviewer: ${reviewerId} added successfully for submissionId: ${submissionId}`);
    }

    catch(err) {
        result(err, null);
    }
}

// Submitting a review by reviewer
Review.submitReviewByReviewer = async (submissionId, reviewerId, outcomeRecommendation, reviewCommentsEditor, reviewCommentsAuthor, revisionReview, result) => {
    try {
        /* Find the submission with the provided submissionId */
        const submission = await Submission_Model.findOne({
            where: { submission_id: submissionId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        /* If no submission found, return an error */
        if (!submission) {
            result(`No Submission exists with the submissionId: ${submissionId}`, null);
            return;
        }

        const review = await Review_Model.findOne({
            where: { submission_id: submissionId, reviewer_id: reviewerId, confirm_to_editor:1 },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        if (!review) {
            result(`Reviewer is not assigned to that submission: ${submissionId}`, null);
            return;
        }

        const outcome = await Outcome_Model.findOne({
            where: { outcome_id: outcomeRecommendation},
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        if (!outcome) {
            result(`Invalid Outcome Recommendation submitted: ${outcomeRecommendation}. Please retry`. null);
            return
        }

        review.update({
            outcome_recommendation: outcomeRecommendation, 
            review_comments_editor: reviewCommentsEditor, 
            review_comments_author: reviewCommentsAuthor,
            revision_review: revisionReview
        })

        const recipient = await Client_Model.findOne({
            where: { client_id: submission.editor_id },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        const reviewer = await Client_Model.findOne({
            where: { client_id: reviewerId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        const emailSubject = "Reviewer's Review Received";
        const emailHTML = `<p> The Reviewer: ${reviewer.first_name} ${reviewer.last_name} has submitted their review of the Submission Title: ${submission.submission_title}.<br/> Please log in to the peer review platform to access it. </p>`;
 
        const recipientEmail = recipient.email;
        console.log("recipientEmail: " + recipientEmail);
 
        await send_email(recipientEmail, emailSubject, emailHTML);
        result(null, `Review submitted by Reviewer with reviewerId: ${reviewerId} for submission with submissionID: ${submissionId} successfully`);
    }

    catch(err) {
        result(err, null);
    }
}

/**
 * Retrieves a list of completed reviews for the specified reviewer.
 * @param {number} reviewer_id - The ID of the reviewer.
 */
Review.getCompletedReviews = async (reviewer_id, result) => {
  try {
    const reviewer = await Client_Role_Model.findOne({
      where: { client_id: reviewer_id, role_id: 4 }
    })

    if (!reviewer) {
      result(`Reviewer not found or invalid`, null);
      return;
    }

    // Execute raw SQL query to select from the view
    const reviews = await sequelize.query(`
    SELECT 
      review_id, 
      submission_id,
      submission_title,
      submission_abstract,
      reviewer_name,
      reviewer_contact_info,
      target_date,
      review_time,
      outcome_name,
      revision_review,
      review_comments_editor,
      review_comments_author
    FROM vw_reviews_overview
    WHERE reviewer_id = :reviewer_id AND outcome_name IS NOT null AND confirm_to_editor = 1`,
      {
        type: QueryTypes.SELECT,
        replacements: { reviewer_id },
      });

    if (reviews.length > 0) {
      result(null, reviews); // Pass the reviews array directly as the second argument
    } else {
      result("No completed reviews found", null);
    }
  }
  catch (err) {
    console.error("Error:", err);
    result(err, null);
  }
}

/* Get All Submissions that the Reviewer has Agreed/Accepted to Review But has not provided a final outcome for, as yet */
Review.getAcceptedSubmissionsForReview = async (reviewerId, result) => 
{
    const reviewer = await Client_Role_Model.findOne({
      where: { client_id: reviewerId, role_id: 4 }
    })

    if (!reviewer) {
      result(`Reviewer not found or invalid`, null);
      return;
    }

    const res = await sequelize.query("SELECT review_id,submission_id,submission_title,submission_abstract,target_date FROM vw_reviews_overview WHERE reviewer_id = :reviewerId AND confirm_to_editor = 1 AND outcome_name is Null", {
      type: QueryTypes.SELECT,
      replacements: {reviewerId},
    });

    if(res)
    {
      if(res.length>0)
        return result(null,res)
      else
        return result("No Submissions Accepted by the Reviewer", null);
    }
    else
      return result("Error",null)
    
}

// Accept a review request
Review.acceptReviewRequest = async (reviewId, reviewerId, result) => {
  try
  {
    const review = await Review_Model.findOne({
      where: { review_id: reviewId},
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (!review) {
      result(`Review request not found`, null);
      return;
    }
  
    if (review.reviewer_id != reviewerId) {
      console.log(review.review_id);
      result(`Reviewer is not assigned to that Review Request: ${reviewId}`, null);
      return;
    }

    if (review.confirm_to_editor != null) 
    {
      console.log(review.reviewer_id);
      result(`You have already responded to this review request with ID: ${reviewId}`, null);
      return;
    }

    const reviewer = await Client_Model.findOne({
      where: { client_id: review.reviewer_id },
      attributes: ['first_name','last_name','email']
    });

    const submission = await Submission_Model.findOne({
      where: { submission_id: review.submission_id},
      attributes: ['submission_title']
    });

    await review.update({confirm_to_editor: 1})

    const target_date = review.target_date;
    const emailSubject = "Submission Accepted for Review";
    const emailHTML = `<p> Hi ${reviewer.first_name} ${reviewer.last_name}, <br/> You have been assigned as the reviewer for the Submission Title: ${submission.submission_title}.  <br/> Please log in to the peer review platform to access it. </p>`;
    const recipientEmail = reviewer.email;
    console.log("recipientEmail: " + recipientEmail);

    const calenderObj = getIcalObjectInstance(target_date, target_date, `Review Deadline`, `You have a review deadline for the review of submission with title "${submission.submission_title}" on the provided date`, "Remote", "SILA" ,"sila44322@gmail.com")

    send_email(recipientEmail, emailSubject, emailHTML,calenderObj);

    result(null, `Review Accepted by Reviewer successfully`);
  }
  catch(err) {
    result(err, null);
  } 
}

// Decline review request
Review.declineReviewRequest = async (reviewId, reviewerId, result) => 
{
  try
  {
    const review = await Review_Model.findOne({
      where: { review_id: reviewId},
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    });

    if (!review) {
      result(`Review request not found`, null);
      return;
    }
  
    if (review.reviewer_id != reviewerId) {
      console.log(review.review_id);
      result(`Reviewer is not assigned to that Review Request: ${reviewId}`, null);
      return;
    }

    if (review.confirm_to_editor != null) {
      console.log(review.review_id);
      result(`You have already responded to this review request with ID: ${reviewId}`, null);
      return;
    }
  
    review.update({
      confirm_to_editor: 0
    })

    result(null, `Review Declined by Reviewer successfully`);
  }
  catch(err) 
  {
    result(err, null);
  } 
}

// Get all review requests
Review.getUnconfirmedReviews = async (reviewer_id, result) => 
{
  try {
    const reviewer = await Client_Role_Model.findOne({
      where: { client_id: reviewer_id, role_id: 4 }
    })

    if (!reviewer) {
      result(`Reviewer not found or invalid`, null);
      return;
    }

    const res = await sequelize.query("SELECT review_id,submission_id,submission_title,submission_abstract,target_date FROM vw_reviews_overview WHERE reviewer_id = :reviewer_id AND confirm_to_editor is Null AND outcome_name is Null", {
      type: QueryTypes.SELECT,
      replacements: {reviewer_id},
    });

    if(res)
    {
      if(res.length>0)
        return result(null,res)
      else
        result("No unconfirmed reviews found for the Reviewer", null);
    }
    else
      return result("Error",null)
  }
  catch (err) {
    console.error("Error:", err);
    result(err, null);
  }
}

// Add inline comment for submission
Manuscript_Comment.create = async (new_comment,submission_id,result) => 
{
  Submission_Model.findOne({
    where: { submission_id: submission_id },
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt']},
  })
  .then(async (submission) => 
  {
    if(!submission)
      result("Submission not found", null)
    else
    {
      // Just need to validate if the manuscript file has been uploaded properly
      const file = await File_Model.findOne({
        where: { submission_id: submission_id,file_description : "Anonymised Manuscript" },
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      });

      const reviewer_check = await Review_Model.findOne({
        where: { submission_id: submission_id,reviewer_id : new_comment.commented_by, confirm_to_editor:1 },
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      })

      if(!reviewer_check)
        return result("Unauthorized to add comment",null);
      
      if(submission.outcome_id || reviewer_check.outcome_recommendation)
        return result("Unauthorized to add comment",null);
      
      if(!file)
        return result("Submission not complete", null);

      new_comment.file_id = file.file_id;
    
      Manuscript_Comment_Model.create(new_comment)
      .then((comment) => 
      {
        result(null,{"message":"Comment creation successfull","comment_id":comment.comment_id})
      })
      .catch(error => 
      {
        result(error,null)
      });
    }
  })
  .catch(error => {
    result(error.original.sqlMessage, null);
  });
}

// Get all inline comments for a submission
Manuscript_Comment.getInlineComments = async (client_id,submission_id,is_review,result) => 
{
  Submission_Model.findOne({
    where: { submission_id: submission_id },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })
  .then(async(submission) => 
  {
    if(submission)
    {
      // Just need to validate if the manuscript file has been uploaded properly
      const file = await File_Model.findOne({
        where: { submission_id: submission_id,file_description : "Anonymised Manuscript" },
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      });

      // Check if the logged in user is a reviewer authorised to access the file
      const reviewer_check = await Review_Model.findOne({
        where: { submission_id: submission_id,reviewer_id : client_id, confirm_to_editor:1 },
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      })

      if(!file)
        return result("Submission not complete",null);

      // If not a valid user that can access the file, return Error
      if (! ((submission.author_id == client_id && is_review!= "true") ||
             (submission.editor_id == client_id && is_review!= "true") ||
             reviewer_check))
      {
        return result("Unauthorized access",null);
      }

      // If the reviewing process is still in progress the author is not allowed to see comments
      if(submission.author_id == client_id)
      {
        if(!submission.outcome_id)
          return result("Unauthorized access",null);
        // Once the outcome is released, the author is allowed to see all comments
        else
        {
          const file_id = file.file_id;
          const res = await sequelize.query("SELECT comments FROM vw_submission_inline_comment WHERE file_id = :file_id AND visible_to_author = 1", {
            type: QueryTypes.SELECT,
            replacements: {file_id},
          });

          if(res)
            return result(null,res)
          else
            return result("Error",null)
        }
      }

      if(reviewer_check)
      {
        // During the review process the reviewer can see only his comments
        if(!submission.outcome_id)
        {          
          const file_id = file.file_id
          const res = await sequelize.query("SELECT comment_id,comments,client_id,first_name,last_name FROM vw_submission_inline_comment WHERE file_id = :file_id AND client_id = :client_id", {
            type: QueryTypes.SELECT,
            replacements: {file_id,client_id},
          });

          if(res)
            return result(null,res)
          else
            return result("Error",null)
        }
        // When the outcome has been released, the reviewers can view comments of other reviewers
        else
        {
          const file_id = file.file_id
          const res = await sequelize.query("SELECT comment_id,comments,client_id,first_name,last_name FROM vw_submission_inline_comment WHERE file_id = :file_id", {
            type: QueryTypes.SELECT,
            replacements: {file_id},
          });

          if(res)
            return result(null,res)
          else
            return result("Error",null)
        }
      }

      // An editor will be able to see all comments after review completion
      if(submission.editor_id == client_id)
      {
        const reviewer_check = await Review_Model.findAll({
          where: { submission_id: submission_id },
          attributes:["outcome_recommendation", "reviewer_id"],
        })

        let return_comments = [];

        if(reviewer_check.length > 0)
        {
          const promises = reviewer_check.map(async (element) => {
            if (element.dataValues.outcome_recommendation) 
            {
              const file_id = file.file_id;
              const commented_by = element.dataValues.reviewer_id;
              const res = await sequelize.query("SELECT comment_id,comments,client_id,first_name,last_name,visible_to_author FROM vw_submission_inline_comment WHERE file_id = :file_id AND client_id = :commented_by", {
                type: QueryTypes.SELECT,
                replacements: {file_id,commented_by},
              });

              if(res.length > 0)
                res.forEach(fetch_comment => {
                  return_comments.push(fetch_comment);
                });
            }
          });
          await Promise.all(promises);
        }    
        return result(null,return_comments)     
      }
    }
    else
    {
      return result("Submission not found", null);
    }

  })
  .catch((error) => 
  {
      console.error("Error:", error);
      return result(error, null);
  });
}

// Delete inline comment 
Manuscript_Comment.deleteInlineComment = async (submission_id,comment_id,client_id,result) => 
{
  const submission = await Submission_Model.findOne({
    where: { submission_id: submission_id},
    attributes: ["outcome_id"],
  });

  const reviewer_check = await Review_Model.findOne({
    where: { submission_id: submission_id,reviewer_id : client_id, confirm_to_editor: 1 },
    attributes: ["outcome_recommendation"],
  })

  if(submission.outcome_id || reviewer_check.outcome_recommendation)
    return result("Unauthorized to delete comment",null);

  const file = await File_Model.findOne({
    where: { submission_id: submission_id,file_description : "Anonymised Manuscript" },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  });

  if(!file)
    return result("Submission not complete",null)

  const comment_to_delete = await Manuscript_Comment_Model.findOne({
    where: { file_id: file.file_id,comment_id : comment_id },
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
  })

  if(!comment_to_delete)
    return result("No such comment found", null);
  // Only authorized to delete the comment made by the commenter
  if(comment_to_delete.commented_by != client_id)
    return result("Unauthorized to delete comment",null);

  Manuscript_Comment_Model.destroy({
    where: { file_id: file.file_id,comment_id : comment_id },
  })
  .then(() => {
      result(null,"Comment deleted succesfully");
  })
  .catch(error => {
    result(error, null)
  });
}

// Change visibility of inline comment 
Manuscript_Comment.changeVisibilityInlineComment = async (submission_id,comment_id,client_id,visible_to_author,result) => 
  {
    const submission = await Submission_Model.findOne({
      where: { submission_id: submission_id},
      attributes: ["editor_id"],
    });

    if(!submission)
      return result("Submission does not exist",null);
  
    console.log(submission.editor_id,client_id);

    // If not a valid editor
    if (submission.editor_id != client_id)
      return result("Unauthorized to change visibility",null);
  
    const file = await File_Model.findOne({
      where: { submission_id: submission_id,file_description : "Anonymised Manuscript" },
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    });
  
    if(!file)
      return result("Submission not complete",null)
  
    const comment_to_change_visibility = await Manuscript_Comment_Model.findOne({
      where: { file_id: file.file_id,comment_id : comment_id },
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    })
  
    if(!comment_to_change_visibility)
      return result("No such comment found", null);
    else
    {
      comment_to_change_visibility.visible_to_author = visible_to_author;
      comment_to_change_visibility.save();
      return result(null,"Visibility updated");
    }
}

module.exports = {Review,Manuscript_Comment};
