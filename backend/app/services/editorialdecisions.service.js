const { Op,QueryTypes } = require("sequelize");
const { Client_Role_Model, Client_Model } = require("../models/client.model.js");
const { Outcome_Model } = require("../models/review.model.js");
const {Submission_Model} = require('../models/submission.model.js');
const { send_email } = require("../utilities/email.js");
const sequelize = require("../models/db.js");

// #region Object constructors
class EditorialDecisions
{
}


// Get all linked submissions given a submission id
EditorialDecisions.getAllUnassignedSubmissions = async (result) => 
{
    Submission_Model.findAll({
        where: { editor_id: null },
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      })
        .then(async (submissions) => 
        {
            if(submissions)
            {
                if(submissions.length > 0)
                {
                    submission_data_values = []
                    submissions.forEach(element => {
                        submission_data_values.push(element.dataValues);
                    });
                    result(null, submission_data_values);
                }
                else
                {
                    result("No unassigned submissions found", null);
                }
            }

        })
        .catch((error) => 
        {
            console.error("Error:", error);
            result(error, null);
        });

}

/**
 * Retrieves all completed manuscripts assigned to the specified editor.
 * @param {int} editorId - The ID of the editor.
 */
EditorialDecisions.getAllCompletedSubmissions = async (editorId, result) => 
{
    try 
    {
        const editor = await Client_Role_Model.findOne({where: { client_id: editorId, role_id: 1 }});

        if (!editor) 
            return result(`Editor not found or invalid`, null);

        const submissions = await Submission_Model.findAll({
            where: { editor_id: editorId, outcome_id:{[Op.not]:null} },
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        });

        if (submissions.length > 0) 
        {
            const submission_data_values = submissions.map(submission => submission.dataValues);
            result(null, submission_data_values);
        } 
        else 
        {
            result("No completed submissions found", null);
        }
    }
    catch (error) 
    {
        console.error("Error:", error);
        result(error, null);
    }
};

/**
 * Retrieves all current manuscripts assigned to the specified editor.
 * @param {int} editorId - The ID of the editor.
 */
EditorialDecisions.getAllCurrentSubmissions = async (editorId, result) => {
    try 
    {
        const editor = await Client_Role_Model.findOne({where: { client_id: editorId, role_id: 1 }});

        if (!editor) 
            return result(`Editor not found or invalid`, null);
        
        
        const submissions = await Submission_Model.findAll({
            where: { editor_id: editorId, outcome_id: null },
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        });

        if (submissions.length > 0) 
        {
            const submission_data_values = [];
            submissions.forEach(async (submission, index) => {
                const submission_id = submission.submission_id;
                const reviews = await sequelize.query(`
                        SELECT 
                        review_id, 
                        reviewer_name,
                        target_date,
                        confirm_to_editor,
                        outcome_name
                        FROM vw_reviews_overview WHERE submission_id = :submission_id`,
                        {
                            type: QueryTypes.SELECT,
                            replacements: { submission_id },
                        });
                const submissionData = submission.dataValues;
                submissionData.review_requests = reviews;
                submission_data_values.push(submissionData);
    
                if (index == submissions.length - 1) 
                {
                    return result(null, submission_data_values);
                }
            })
        }  
        else 
        {
            return result("No current submissions found", null);
        }
    } 
    catch (error) 
    {
        console.error("Error:", error);
        return result(error, null);
    }
}

EditorialDecisions.assignSubmissionsToEditor = async (submissionId, editorId, result) => {    
    try {
        /* Find the submission with the provided submissionId */
        const submission = await Submission_Model.findOne({
            where: { submission_id: submissionId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        /* If no submission found, return an error */
        if (!submission) {
            result(`Submission with provided submissionId: ${submissionId} not found`, null);
            return;
        }

        /* Check if the submission already has an editor assigned */
        if (submission.editor_id) {
            result('Submission already has an editor assigned', null);
            return;
        }

        /*  Check if the editorId is a valid editor */
        const editor = await Client_Role_Model.findOne({
            where: { client_id: editorId, role_id: 1}
        });

        if (!editor) {
            result('Invalid editor ID', null);
            return;
        }

        /* Send an email to the client to confirm the successful submission */
        const emailSubject = "New Manuscript Assigned to You";
        const emailHTML = `<p>You have been assigned a new manuscript submission '${submission.submission_title}'. Please log on to the peer review platform to access it. </p>`;

        const recipient = await Client_Model.findOne({
            where: { client_id: editorId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        const recipientEmail = recipient.email;
        console.log("recipientEmail: " + recipientEmail);

        send_email(recipientEmail, emailSubject, emailHTML);
        /* Update the submission with the provided editorId and update the status of the submission*/
        await submission.update({ editor_id: editorId, status: "Under Primary Review" });
        result(null, 'Manuscript assigned to editor successfully');

    } catch (error) {
        result(error, null);
    }
};

// Get all reviews for a submission
EditorialDecisions.getReviewsForSubmission = async (submissionId, client_id, result) => 
{    
    try 
    {
        /* Find the submission with the provided submissionId */
        const submission = await Submission_Model.findOne({
            where: { submission_id: submissionId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        /* If no submission found, return an error */
        if (!submission) 
            return result(`Submission with provided submissionId: ${submissionId} not found`, null);

        /* Check if the editor is authorized*/
        if (submission.editor_id != client_id) 
            return result('You are not authorized to view these reviews', null);

        
        const res = await sequelize.query("SELECT reviewer_name,outcome_name,review_comments_editor,review_comments_author, confirm_to_editor, target_date FROM vw_reviews_overview WHERE submission_id=:submissionId AND confirm_to_editor = 1", {
            type: QueryTypes.SELECT,
            replacements: {submissionId},
          });

        if(res)
        {
            if (res.length>0)
                return result(null,res)
            else
                return result("No reviews have been published yet")
        }
        else
            return result("Error",null)

    } 
    catch (error) 
    {
        result(error, null);
    }
};

// Reassign a manuscript to another editor, done by an editor
EditorialDecisions.reassignSubmissionByEditor = async (submissionId, editorId, newEditorId, result) => {
    /* If an Editor has been assigned a particular manuscript, they can re-assign it to another editor. 
       Only the editor that has been assigned a particular submission, can reassign that particular submission  */
    
    try {

       /*  Check if the editorId is a valid editor */
       const editor = await Client_Role_Model.findOne({
            where: { client_id: editorId, role_id: 1}
        });

        if (!editor) {
            result(`Editor not found or invalid`, null);
            return;
        }

        /*  Check if the assigned editorId is valid and is an editor */
        const newEditor = await Client_Role_Model.findOne({
            where: { client_id: newEditorId, role_id: 1}
        });

        if (!newEditor) {
            result(`Editor Assigned not found or invalid`, null);
            return;
        }
        
        /* Find the submission with the provided submissionId */
        const submission = await Submission_Model.findOne({
            where: { submission_id: submissionId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        /* If no submission found with that submissionId, return an error */
        if (!submission) {
            result(`Submission not found`, null);
            return;
        }

        /* Check if the submission does not have an editor assigned */
        if (!submission.editor_id) {
            result('Submission does not have any editors assigned to it to be able to reassign', null);
            return;
        }

        /* Check if the submission already has an editor assigned */
        if (submission.editor_id != editorId) {
            result('You are not authorized to reassign this submission', null);
            return;
        }
        /* Valid submission found which has been assigned to the logged in Editor */

        /* Send an email to the client to confirm the successful submission */
        const emailSubject = "New Manuscript Assigned to You";
        const emailHTML = `<p>You have been assigned a new manuscript submission '${submission.submission_title}'. Please log on to the peer review platform to access it. </p>`;
 
        const recipient = await Client_Model.findOne({
            where: { client_id: newEditorId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });
 
        const recipientEmail = recipient.email;
        console.log("recipientEmail: " + recipientEmail);
 
        send_email(recipientEmail, emailSubject, emailHTML);

        /* Update the submission with the provided editorId */
        await submission.update({ editor_id: newEditorId});
        result(null, `Submission reassigned to Editor with Editor ID: ${newEditorId} successfully`);    
    }
    catch(err) {
        result(err, null);
    }

}

/**
 * Updates the outcome and status of a submission in the Studies in Language Assessment (SiLA) journal.
 *
 * @param {int} submissionId - The ID of the submission to update.
 * @param {int} editorId - The ID of the editor updating the submission.
 * @param {int} outcomeRecommendation - The ID of the new outcome recommendation for the submission.
 * @param {string} commentsToAuthor - Commens that the Editor wants to pass on to the Author.
 */
EditorialDecisions.updateSubmissionOutcome = async (submissionId, editorId, outcomeRecommendation, commentsToAuthor, result) => {
    try {
        const comments = commentsToAuthor;
        console.log(`comments: ${comments}`);
        /*  Check if the editorId is a valid editor */
        const editor = await Client_Role_Model.findOne({
            where: { client_id: editorId, role_id: 1 }
        });

        if (!editor) {
            result(`Editor not found or invalid`, null);
            return;
        }

        /* Find the submission with the provided submissionId */
        const submission = await Submission_Model.findOne({
            where: { submission_id: submissionId },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        /* If no submission found with that submissionId, return an error */
        if (!submission) {
            result(`Submission not found`, null);
            return;
        }

        /* Check if editor assigned to the submission == editor trying to update the outcome */
        if (submission.editor_id != editorId) {
            result('You are not the authorized Editor to update the outcome of this submission', null);
            return;
        }

        const outcome = await Outcome_Model.findOne({
            where: { outcome_id: outcomeRecommendation },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        });

        if (!outcome) {
            result(`Invalid Outcome Recommendation submitted: ${outcomeRecommendation}. Please retry`, null);
            return
        }

        const author = await Client_Model.findOne({
            where: { client_id: submission.author_id },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        })

        /* Send an email to the client to confirm the successful submission */
        const emailSubject = "Your Submission Outcome has been Updated!";
        const emailHTML = `<p> Hi, ${author.first_name} ${author.last_name}, <br/> The current outcome of your submission '${submission.submission_title}' to the Studies in Language Assessment (SiLA) journal has been updated to '${outcome.outcome_name}'. <br/> Please log on to the peer review platform to access it and for more details. </p>`;

        const recipientEmail = author.email;
        console.log("recipientEmail: " + recipientEmail);

        send_email(recipientEmail, emailSubject, emailHTML);

        /* Update the Outcome and Status of the submission  */
        await submission.update({
            outcome_id: outcomeRecommendation,
            status: "Outcome Published",
            comments_to_author: commentsToAuthor
          });
        
        result(null, `Submission Outcome Updated to '${outcome.outcome_name}' successfully`);
    }
    catch (err) {
        console.error('Error in updateSubmissionOutcome:', err);
        result(`An error occurred while updating the submission outcome: ${err.message}`, null);
    }
}

module.exports = { EditorialDecisions };