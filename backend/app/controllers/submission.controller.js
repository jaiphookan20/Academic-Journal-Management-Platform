const { Submission,Submission_Access, File } = require("../services/submission.service.js");
const fs = require("fs");
const path = require("path");
const { send_email } = require("../utilities/email.js");
const {random_token_string} = require("../utilities/manage.token.js");
const zipdir = require('zip-dir');

exports.create = async (req, res) => 
{

  // Check if the request body is empty 
  if (!req.body) 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    res.status(400).json({ error: "Content cannot be empty." });
    return;
  }

  if(!req.body.submission_title || req.body.submission_title == '') 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    return res.status(400).json({'error':'Submission title is mandatory'});
  }
  if(!req.body.submission_type || req.body.submission_type == '') 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    return res.status(400).json({'error':'Submission type is mandatory'});
  }
  if(!req.body.abstract || req.body.abstract == '') 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    return res.status(400).json({'error':'Abstract is mandatory'});
  }
  if(!req.body.acknowledgements || req.body.acknowledgements == '') 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    return res.status(400).json({'error':'Acknowledgement is mandatory'});
  }  
  if(!req.body.conflict_of_interest || req.body.conflict_of_interest == '') 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    return res.status(400).json({'error':'Conflict of interest information is mandatory'});
  }  
  if(!req.body.authors || req.body.authors == '') 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    return res.status(400).json({'error':'Info about authors is mandatory'});
  }  

  // Create a new submission object 
  const new_submission = new Submission({
    author_id: res.locals.client_id,
    submission_title: req.body.submission_title,
    parent_submission_id: req.body.parent_submission_id,
    submission_type: req.body.submission_type,
    abstract: req.body.abstract,
    acknowledgements: req.body.acknowledgements,
    conflict_of_interest: req.body.conflict_of_interest,
    authors: req.body.authors,
  });

  new_submission.status = "Submitted";
  
  // Check if files were submitted 
  if (!req.files) 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    return res.status(500).json({ error: "No files submitted" });
  }

  // Validate the file descriptions 
  try 
  {
    JSON.parse(req.body.file_descriptions);
  } 
  catch (err) 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    return res.status(500).json({ error: "Invalid JSON input or file description" });
  }

  // Ensure the number of file descriptions matches the number of files 
  if (JSON.parse(req.body.file_descriptions).length != req.files.length) 
  {
    removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
    return res.status(500).json({ error: "Number of descriptions do not match the number of files" });
  }


  // Save the submission to the database
  Submission.create(new_submission, async (err, response) => 
  {
    if (err) 
    {
      removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
      res.status(500).json({ error: err });
      return;
    }

    try 
    {
      const files = Array.isArray(req.files) ? req.files : [req.files];

      const destinationDir = path.resolve(__dirname, `../../../data/uploads/${res.locals.client_id}/${response.submission_data.submission_id}`);
      // Create the submission directory recursively
      fs.mkdirSync(destinationDir, { recursive: true });

      files.forEach((file,index) => 
      {
        // Construct the destination path for the file 
        const destinationPath = path.join(destinationDir, file.originalname);
        const fileDesc = JSON.parse(req.body.file_descriptions)[index];

        // Move the uploaded files from the uploads folder to the submission directory
        fs.renameSync(file.path, destinationPath);

        // Create a new file record 
        const new_file = new File({
          submission_id: response.submission_data.submission_id,
          file_name: file.originalname,
          file_description: fileDesc.file_description,
        });

        // Create new file entries in the database
        File.create(new_file, (err, response) => 
        {
          if(err)
          {
            removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
            res.status(500).json({ error: err });
            return;
          }
        });
      });

      // Create zip of all submission files for easier download
      const folderPath = path.resolve(__dirname, `../../../data/uploads/${res.locals.client_id}/${response.submission_data.submission_id}`);
      const outputZipFilePath = path.resolve(__dirname, `../../../data/uploads/${res.locals.client_id}/${response.submission_data.submission_id}/submission_files.zip`);
      zipdir(folderPath, { saveTo: outputZipFilePath }, function (err, buffer) 
      {
        if (err) 
            console.error('Error archiving folder:', err);
        else
          console.log('Folder archived successfully:', outputZipFilePath);
      });
    }
    catch(err)
    {
      removeAllFilesSync(path.resolve(__dirname, `../../../data/uploads`));
      res.status(500).json({ error: err });
      return
    }

    /* Send an email to the client to confirm the successful submission */
    const emailSubject = "Manuscript Submission Successful";
    const emailHTML = `<p>Your manuscript has been successfully submitted</p>`;

    const email = response.author_email;

    send_email(email, emailSubject, emailHTML);
    res.status(200).json({ message: "Submission successful" });
  });
};

function removeAllFilesSync(directory) 
{
  const files = fs.readdirSync(directory);
  
  for (const file of files) 
  {
      const filePath = path.join(directory, file);
      if(!fs.lstatSync(filePath).isDirectory())
        fs.unlinkSync(filePath);
  }
}

// Retrieve all Submissions By Author
exports.getAllLatestSubmissionsByAuthor = async (req, res) => 
{
  const author_id = res.locals.client_id;
  Submission.getAllLatestSubmissionsByAuthor(author_id,(err,result) => {
    if (err) {
      console.log(err)
      const message =
        err || "Some error occurred while trying to retrieve all editors.";
      res.status(400).json({ error: message });
      return;
    } else {
      res.status(200).send(result);
    }
  });
}

// Retrive submission details by ID
exports.getSubmissionbyID = async (req, res) => 
{
  const client_id = res.locals.client_id;
  const submission_id = req.params.submission_id;
  if(!req.params.submission_id || req.params.submission_id == undefined)
    return res.status(400).json({ error: "Submission ID is mandatory in params" });

  Submission.getSubmissionbyID(client_id,submission_id,(err,result) => {
    if (err) {
      console.log(err)
      const message =
        err || "Some error occurred while trying to retrieve submission data by ID";
      res.status(400).json({ error: message });
      return;
    } else {
      res.status(200).send(result);
    }
  });
}


// Retrieve all Linked Submissions in a chain 
exports.getAllLinkedSubmissions = async (req, res) => 
{
  const author_id = res.locals.client_id;

  if(!req.params.original_submission_id || req.params.original_submission_id == '') 
  {
    return res.status(400).json({'error':'Submission id is mandatory in params'});
  }

  const original_submission_id = req.params.original_submission_id;

  Submission.getAllLinkedSubmissions(author_id,original_submission_id,(err,result) => {
    if (err) {
      console.log(err)
      const message =
        err || "Some error occurred while trying to retrieve all editors.";
      res.status(400).json({ error: message });
      return;
    } else {
      res.status(200).send(result);
    }
  });
}

// Get Submission Access token
exports.getSubmissionAccess = async (req, res) => 
{
  if(!req.params.submission_id || req.params.submission_id == '') 
  {
    return res.status(400).json({'error':'Submission id is mandatory in params'});
  }

  if(!req.params.is_review == 'true' || !req.params.is_review == 'false') 
  {
    return res.status(400).json({'error':'Enter false for view mode and true for review mode as second parameter'});
  }

  const is_review = req.params.is_review;
  const client_id = res.locals.client_id;
  const new_access_token = new Submission_Access({
    submission_id: parseInt(req.params.submission_id),
    access_token: random_token_string()
  });

  Submission.getSubmissionAccess(new_access_token,client_id,is_review,(err,result) => {
    if (err) 
    {
      console.log(err)
      const message =
        err || "Some error occurred while trying to retrieve all editors.";
      res.status(400).json({ error: message });
      return;
    } 
    else 
    {
      res.status(200).json({"access_token":result.dataValues.access_token});
    }
  });
}

// Get manucript of submission
exports.getManuscript = async (req, res) => 
{
  const access_token = req.params.access_token;
  if(!req.params.access_token || req.params.access_token == '') 
  {
    return res.status(400).json({'error':'Access token is mandatory in params'});
  }

  Submission.getManuscript(access_token,(err,result) => {
    if (err) 
    {
      console.log(err)
      const message =
        err || "Some error occurred while trying to retrieve all editors.";
      res.status(400).json({ error: message });
      return;
    } 
    else 
    {
      res.sendFile(path.join(__dirname, result));
    }
  });
}

// Get all files of submission
exports.getAllFiles = async (req, res) => 
  {
    const access_token = req.params.access_token;
    if(!req.params.access_token || req.params.access_token == '') 
    {
      return res.status(400).json({'error':'Access token is mandatory in params'});
    }
  
    Submission.getAllFiles(access_token,(err,result) => {
      if (err) 
      {
        console.log(err)
        const message =
          err || "Some error occurred while trying to retrieve the submission files.";
        res.status(400).json({ error: message });
        return;
      } 
      else 
      {
        console.log(res)
        res.sendFile(path.join(__dirname, result));
      }
    });
}
  
  