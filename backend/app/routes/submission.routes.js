const SubmissionController = require("../controllers/submission.controller.js");
const { authorize,authorize_role } = require("../utilities/authorize.js");
const multer = require("multer");
const fs = require("fs");

// File extension filters
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    cb(null, true);
  else
    cb(
      "Invalid file type. Only jpeg, jpg, png, pdf, doc and docx allowed",
      null
    );
};

// File destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../data/uploads");
  },
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter, // jpg,pdf,docx,png,jpeg allowed
  limits: { fileSize: 1024 * 1024 * 5 }, // File size limit 5mb
}).array("files");

var router = require("express").Router();

function fileUploadWithErrorHandling(req, res, next) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).json({ error: err.code });
    } else if (err) {
      res.status(500).json({ error: err });
    } else {
      next();
    }
  });
}

module.exports = (app) => {

  //Create the uploads folder if it doesnt exist
  fs.mkdirSync("../data/uploads", { recursive: true });

  router.post("/",authorize_role(["Author"]),fileUploadWithErrorHandling,SubmissionController.create);

  // Get All Latest Submissions by Author
  router.get("/get-all-latest-submissions",authorize_role(["Author"]), SubmissionController.getAllLatestSubmissionsByAuthor);
  
  // Get Submission by ID
  router.get("/get-submission/:submission_id",authorize_role(["Author","Editor"]), SubmissionController.getSubmissionbyID);

  // Get All Linked Submissions by Submission id
  router.get("/get-all-linked-submissions/:original_submission_id",authorize_role(["Author"]), SubmissionController.getAllLinkedSubmissions);
  
  // Get Manuscript
  router.get("/get-manuscript/:access_token", SubmissionController.getManuscript);

  // Get All files 
  router.get("/get-all-files/:access_token", SubmissionController.getAllFiles);
  
  // Get Submission Access
  router.post("/get-submission-access/:submission_id/:is_review",authorize(), SubmissionController.getSubmissionAccess);
  
  app.use("/submission", router);
};
