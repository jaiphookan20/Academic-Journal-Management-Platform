const { EditorialDecisions } = require("../services/editorialdecisions.service.js");

// Retrieve all Unassigned Manuscripts in the table
exports.getAllUnassignedSubmissions = async (req, res) => 
{
    EditorialDecisions.getAllUnassignedSubmissions((err,result) => {
    if (err) {
      console.log(err)
      const message =
        err || "Some error occurred while trying to retrieve all unassigned manuscripts.";
      res.status(400).json({ error: message });
      return;
    } else {
      res.status(200).send(result);
    }
  });
}

exports.getAllCompletedSubmissions = async (req, res) => 
{   
    editorId = res.locals.client_id;
    EditorialDecisions.getAllCompletedSubmissions(editorId, (err,result) => {
    if (err) 
    {
      console.log(err)
      const message =
        err || "Some error occurred while trying to retrieve all completed submissions.";
      res.status(400).json({ error: message });
      return;
    } 
    else 
    {
      res.status(200).send(result);
    }
  });
}

  exports.getAllCurrentSubmissions = async (req, res) => 
    {
      editorId = res.locals.client_id;
      EditorialDecisions.getAllCurrentSubmissions(editorId, (err,result) => {
      if (err) {
        console.log(err)
        const message =
          err || "Some error occurred while trying to retrieve all current submissions.";
        res.status(400).json({ error: message });
        return;
      } else {
        res.status(200).send(result);
      }
    });
  }

exports.assignSubmissionsToEditor = async (req, res) => {
    const submissionId = req.body.submission_id;
    const editorId = req.body.editor_id;

    if (submissionId == "" || editorId == "")
      return res.status(400).json({ error: "Submission ID and Editor ID is mandatory" });

    if (submissionId == undefined || editorId == undefined)
      return res.status(400).json({ error: "Invalid Submission ID or Editor ID" });

    EditorialDecisions.assignSubmissionsToEditor(submissionId, editorId, (err, result) => {
      if (err) {
        const message = err || "Some error occurred while assigning manuscript to Editor.";
        return res.status(500).json({ error: message });
      } else {
        return res.status(200).json({ message: `Manuscript with submissionId: ${submissionId} successfully assigned to Editor with editorId: ${editorId}` });
      }
    })
}

// Get all reviews for a submission
exports.getReviewsForSubmission = async (req, res) => 
{
  const submissionId = req.params.submission_id;
  const client_id = res.locals.client_id;

  if (submissionId == "" || submissionId == undefined)
    return res.status(400).json({ error: "Submission ID is mandatory in the params" });

  EditorialDecisions.getReviewsForSubmission(submissionId,client_id, (err, result) => {
    if (err) 
    {
      const message = err || "Some error occurred while getting all reviews";
      return res.status(500).json({ error: message });
    } 
    else 
    {
      return res.status(200).send(result);
    }
  })
}

exports.reassignSubmissionByEditor = async (req, res) => {
  const submissionId = req.body.submissionId;
  const editorId = res.locals.client_id;
  const newEditorId = req.body.newEditorId;

  /* If I (the logged in client) is in fact the editor (editorId) that has been assigned the submission, 
     I am allowed to reassign it */

    if (submissionId == "" || editorId == "" || newEditorId == "") {
      return res.status(400).json({ error: "Submission ID, Editor ID and newEditorId is mandatory" });
    }

    if (submissionId == undefined || editorId == undefined || newEditorId == undefined) {
      return res.status(400).json({ error: "Invalid Submission ID or Editor ID or newEditorId" });
    }

    else {

      EditorialDecisions.reassignSubmissionByEditor(submissionId, editorId, newEditorId, (err, result) => {
        if (err) {
          const message = err || "Some error occurred while reassigning submission to the Editor";
          return res.status(500).json({ error: message });
        } else {
          res.status(200).send(result);
        }
      })

    }
}

exports.updateSubmissionOutcome = async (req, res) => {
    const submissionId = req.body.submissionId;
    const outcomeRecommendation = req.body.outcomeRecommendation;
    const editorId = res.locals.client_id;
    const commentsToAuthor = req.body.commentsToAuthor;
    

    if (!Number.isInteger(outcomeRecommendation)) {
      return res.status(400).json({ error: "Please provide a valid value for the Outcome Recommendation" });
    }
    
    if (submissionId == "" || editorId == "" || outcomeRecommendation == "" || commentsToAuthor == "") {
      return res.status(400).json({ error: "Submission ID, Outcome Recommendation and Comments to Author is mandatory" });
    }

    if (submissionId == undefined || editorId == undefined || outcomeRecommendation == undefined || commentsToAuthor == undefined) {
      return res.status(400).json({ error: "Invalid Submission ID or Outcome Recommendation or Comments to Author" });
    }

    else {

      EditorialDecisions.updateSubmissionOutcome(submissionId, editorId, outcomeRecommendation, commentsToAuthor, (err, result) => {
        if (err) {
          const message = err || "Some error occurred while trying to update the outcome of the submission";
          return res.status(500).json({ error: message });
        } else {
          res.status(200).json({message: result})
        }
      })

    }
}