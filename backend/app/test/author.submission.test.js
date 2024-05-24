const request = require("supertest");
const app = require("../../server.js");
const truncateTables = require("../utilities/truncate.tables.js");
const { Client, Client_Role } = require("../services/client.service.js");
const { Client_Model, Client_Role_Model } = require('../models/client.model.js');

const submissionDataObjects = [
  /* Correct Submission: Number of Files Submitted & File Descriptions are equal */
  {
    submission_title: "My Awesome Research Paper",
    submission_type: "Normal",
    abstract: "This is a summary of my awesome research paper",
    acknowledgements: "None",
    conflict_of_interest: "None",
    authors: "John Doe, Jane Doe",
    file_descriptions: JSON.stringify([
      { file_description: "Manuscript" },
      { file_description: "Appendix" },
    ]),
  },
  /* Correct Submission Object + Valid Filetype Submissions */
  {
    submission_title: "My Awesome Research Paper",
    submission_type: "Normal",
    abstract: "This is a summary of my awesome research paper",
    acknowledgements: "None",
    conflict_of_interest: "None",
    authors: "John Doe, Jane Doe",
    file_descriptions: JSON.stringify([
      { file_description: "Manuscript" },
      { file_description: "Appendix" },
    ]),
  },
  /* Correct Submission Object + 1 Invalid Filetype Submissions + 1 Valid Filetype */
  {
    submission_title: "My Awesome Research Paper",
    submission_type: "Normal",
    abstract: "This is a summary of my awesome research paper",
    acknowledgements: "None",
    conflict_of_interest: "None",
    authors: "John Doe, Jane Doe",
    file_descriptions: JSON.stringify([
      { file_description: "Manuscript" },
      { file_description: "Appendix" },
    ]),
  },
  /* Correct Submission Object + 2 Invalid Filetype Submissions */
  {
    submission_title: "My Awesome Research Paper",
    submission_type: "Normal",
    abstract: "This is a summary of my awesome research paper",
    acknowledgements: "None",
    conflict_of_interest: "None",
    authors: "John Doe, Jane Doe",
    file_descriptions: JSON.stringify([
      { file_description: "Manuscript" },
      { file_description: "Appendix" },
    ]),
  },
  /* Empty file_descriptions: */
  {
    submission_title: "My Awesome Research Paper",
    submission_type: "Normal",
    abstract: "This is a summary of my awesome research paper",
    acknowledgements: "None",
    conflict_of_interest: "None",
    authors: "John Doe, Jane Doe",
    file_descriptions: "",
  },
  /* Number of file_descriptions (1) does not equal number of files submitted (2) */
  {
    submission_title: "My Awesome Research Paper",
    submission_type: "Normal",
    abstract: "This is a summary of my awesome research paper",
    acknowledgements: "None",
    conflict_of_interest: "None",
    authors: "John Doe, Jane Doe",
    file_descriptions: JSON.stringify([
      { file_description: "Manuscript" },
      { file_description: "Appendix" },
    ]),
  },
  /* Number of file_descriptions (2) does not equal number of files submitted (1) */
  {
    submission_title: "My Awesome Research Paper",
    submission_type: "Normal",
    abstract: "This is a summary of my awesome research paper",
    acknowledgements: "None",
    conflict_of_interest: "None",
    authors: "John Doe, Jane Doe",
    file_descriptions: JSON.stringify([{ file_description: "Manuscript" }]),
  },
];

const filesArr = [
  /* Num of files (2) equals num of file_descriptions (2) */
  [
    {
      name: "file1.docx",
      content: Buffer.from("Test file content 1"),
      contentType: "application/pdf",
    },
    {
      name: "file2.pdf",
      content: Buffer.from("Test file content 2"),
      contentType: "application/pdf",
    },
  ],
  /* Num files (2) && valid filetypes: jpeg and png */
  [
    {
      name: "file1",
      content: Buffer.from("Test file content 1"),
      contentType: "image/jpeg",
    },
    {
      name: "file2",
      content: Buffer.from("Test file content 2"),
      contentType: "image/png",
    },
  ],
  /* Num files (2) && 1 valid filetype and 1 invalid: "application/pdf" and "application/vnd.ms-powerpoint" */
  [
    {
      name: "file1",
      content: Buffer.from("Test file content 1"),
      contentType: "application/pdf",
    },
    {
      name: "file2",
      content: Buffer.from("Test file content 2"),
      contentType: "application/vnd.ms-powerpoint",
    },
  ],
  /* Num files (2) && 2 invalid: "vnd.ms-excel" and "application/vnd.ms-powerpoint" */
  [
    {
      name: "file1",
      content: Buffer.from("Test file content 1"),
      contentType: "application/vnd.ms-excel",
    },
    {
      name: "file2",
      content: Buffer.from("Test file content 2"),
      contentType: "application/vnd.ms-powerpoint",
    },
  ],
  /* Num of files = 2 but testing Empty file_descriptions */
  [
    {
      name: "file1.docx",
      content: Buffer.from("Test file content 1"),
      contentType: "application/pdf",
    },
    {
      name: "file2.pdf",
      content: Buffer.from("Test file content 2"),
      contentType: "application/pdf",
    },
  ],
  /* Num of files (1) DOES NOT equal num of file_descriptions (2) */
  [
    {
      name: "file1.docx",
      content: Buffer.from("Test file content 1"),
      contentType: "application/pdf",
    },
  ],
  /* Num of files (2) DOES NOT equal num of file_descriptions (1) */
  [
    {
      name: "file1.docx",
      content: Buffer.from("Test file content 1"),
      contentType: "application/pdf",
    },
    {
      name: "file2.pdf",
      content: Buffer.from("Test file content 2"),
      contentType: "application/pdf",
    },
  ],
];

async function authorSignInRequisites() 
{
  await truncateTables();

  // Creating a user for signin
  const author = new Client({
    username: 'sample_author',
    first_name: 'Number 1',
    last_name: 'Dubakoor',
    email: 'sample_author@student.unimelb.edu.au',
    institution_name: 'Uni',
    orcid: 'orcid',
    pronoun: 'other',
    salt: '$2b$10$08Sh/Cl5z59daQj0IK9ae.',
    password_hash: '$2b$10$08Sh/Cl5z59daQj0IK9ae.VPFE.zpMZ6toZo.I09pNlEH0BjBbjkC',
    email_verified: 1
  });

  const created_editor = await Client_Model.create(author);

  // Give the user, editor and author role
  const client_role_author = new Client_Role("Author");
  client_role_author.client_id = created_editor.dataValues.client_id;
  await Client_Role_Model.create(client_role_author);

  // // Creating a user for Author signin
  // const res = await sql
  //   .promise()
  //   .query(
  //     "INSERT INTO `clients` VALUES (NULL,'sample_author','Sample','Author','sample_author@student.unimelb.edu.au','orcid_abc',NULL,'other','$2b$10$08Sh/Cl5z59daQj0IK9ae.','$2b$10$08Sh/Cl5z59daQj0IK9ae.VPFE.zpMZ6toZo.I09pNlEH0BjBbjkC',NULL,1,NULL,NULL,'2024-03-25 10:20:39','2024-03-25 10:20:39');"
  //   );
  // // Giving Author role to the new user
  // await sql
  //   .promise()
  //   .query(
  //     "INSERT INTO `client_role` VALUES (1000," +
  //       res[0].insertId +
  //       ",3,'2024-03-27 00:55:12',NULL);"
  //   );
}

async function signUpAuthor() {
  await request(app).post("/client/signup").send({
    username: "sample_author",
    first_name: "Sample",
    last_name: "Author",
    email: "sample_author@student.unimelb.edu.au",
    institution_name: "University of Melbourne",
    pronoun: "other",
    password: "Qwerty123!",
  });
}

const response_status = [200, 500, 500, 500, 500, 500, 500];
const response_body = [
  "Submission successful",
  "Invalid file type. Only jpeg, jpg, png, pdf, doc and docx allowed",
  "Invalid file type. Only jpeg, jpg, png, pdf, doc and docx allowed",
  "Invalid file type. Only jpeg, jpg, png, pdf, doc and docx allowed",
  "Invalid JSON input or file description",
  "Number of descriptions do not match the number of files",
  "Number of descriptions do not match the number of files",
];

async function loginAuthor() {
  await truncateTables();
  const response = await request(app).post("/client/signin").send({
    username: "sample_author",
    password: "Qwerty123!",
  });

  // console.log("Full response body:", response.body);

  if (!response.body.jwt_token) {
    throw new Error("jwt_token is not present in the response body.");
  }

  return response.body.jwt_token;
}

describe("POST /submission", () => {
  let author_jwt_token;

  beforeAll(async () => {
    await truncateTables();
    await signUpAuthor();
    authorSignInRequisites();
    author_jwt_token = await loginAuthor();
  });

  submissionDataObjects.forEach((submissionData, index) => {
    test(`Test case ${index + 1} with file.descriptions: ${
      submissionDataObjects[index].file_descriptions
    } && files.length: ${filesArr[index]?.length} )}: `, async () => {
      let req = request(app)
        .post("/submission")
        .set("Authorization", `Bearer ${author_jwt_token}`)
        .field("submission_title", submissionData.submission_title)
        .field("submission_type", submissionData.submission_type)
        .field("abstract", submissionData.abstract)
        .field("acknowledgements", submissionData.acknowledgements)
        .field("conflict_of_interest", submissionData.conflict_of_interest)
        .field("authors", submissionData.authors)
        .field("file_descriptions", submissionData.file_descriptions);

      // Attach files to the request
      const files = filesArr[index];

      files.forEach((file) => {
        req = req.attach("files", file.content, file.name);
      });

      const response = await req;
      console.log(response.body);

      expect(response.status).toBe(response_status[index]);

      if (response.status !== 200) {
        expect(response.body.error).toEqual(response_body[index]);
      } else {
        expect(response.body.message).toEqual(response_body[index]);
      }
    });
  });

  // Clean up after all tests are done
  afterAll(async () => {
    await truncateTables();
  });
});
