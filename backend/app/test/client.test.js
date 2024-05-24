const request = require("supertest");
const app = require("../../server.js");
const truncateTables = require("../utilities/truncate.tables.js");
const { Client, Client_Role } = require("../services/client.service.js");
const { Client_Model, Client_Role_Model } = require('../models/client.model.js');

beforeAll(async () => {
  await truncateTables();
});

// #region Signup test cases

const signup_authors = [
  {
    username: "TestUser1",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe1@example.com",
    institution_name: "University A",
    pronoun: "he/him",
    password: "password@D5",
  },
  {
    username: "TestUser2",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe2@example.com",
    institution_name: "University A",
    pronoun: "he/him",
    password: "password@D5",
  },
  {
    username: "TestUser1",
    first_name: "John",
    last_name: "Doe",
    email: "different@example.com",
    institution_name: "University A",
    pronoun: "he/him",
    password: "password@D5",
  },
  {
    username: "Different",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe1@example.com",
    institution_name: "University A",
    pronoun: "he/him",
    password: "password@D5",
  },
  // Add more users as needed
];

const signup_response_status = [200, 200, 500, 500];
const signup_response_body = [
  "",
  "",
  "Duplicate entry 'TestUser1' for key 'clients.username'",
  "Duplicate entry 'john.doe1@example.com' for key 'clients.email'",
];

describe("POST /client/signup", () => {
  test("should sign up if all criteria met", async () => {
    const promises = [];
    for (let i = 0; i < signup_authors.length; i++) {
      const user = signup_authors[i];

      const promise = await request(app)
        .post("/client/signup")
        .send(user)
        .then((response) => {
          expect(response.status).toBe(signup_response_status[i]);

          if (signup_response_status[i] == 500) {
            expect(response.body.error).toEqual(signup_response_body[i]);
          }
        });
      promises.push(promise);
    }
    // Wait for all requests to complete
    await Promise.all(promises);
  });
});

// #endregion



let editor_jwt = null;

// #region Login test cases
async function login_test_requisites() 
{
  await truncateTables();

  // Creating a user for signin
  const editor = new Client({
    username: 'sample_editor',
    first_name: 'Number 1',
    last_name: 'Dubakoor',
    email: 'sample_editor@student.unimelb.edu.au',
    institution_name: 'Uni',
    orcid: 'orcid',
    pronoun: 'other',
    salt: '$2b$10$bJZV.MMykqNzLuqxw/EwGO',
    password_hash: '$2b$10$bJZV.MMykqNzLuqxw/EwGOYutUiV9/r7VehUZsaVfaPICbeOKnb32',
    email_verified: 1
  });

  const created_editor = await Client_Model.create(editor);

  // Give the user, editor and author role
  const client_role_author = new Client_Role("Author");
  const client_role_editor = new Client_Role("Editor");
  client_role_author.client_id = created_editor.dataValues.client_id;
  client_role_editor.client_id = created_editor.dataValues.client_id;
  await Client_Role_Model.create(client_role_author);
  await Client_Role_Model.create(client_role_editor);
}

// DO not change the first entry since it is called at multiple places
const login = [
  {
    username: "sample_editor",
    password: "password@D5",
  },
  {
    username: "does_not_exist",
    password: "password@D5",
  },
  {
    username: "sample_editor",
    password: "12345678",
  },
];

const edit_account = [
  {
    first_name: "sampleEditor",
    last_name: "new last name",
    institution_name: "Uni",
    pronoun: "he/him",
  },
  {
    first_name: "",
    last_name: "new last name",
    institution_name: "Uni",
    pronoun: "he/him",
  },
  {
    first_name: "First Name",
    last_name: "",
    institution_name: "Uni",
    pronoun: "he/him",
  },
  {
    first_name: "First Name",
    last_name: "Last name",
    institution_name: "",
    pronoun: "he/him",
  },
];

const login_response_status = [200, 400, 400];
const login_response_body = ["", "Username not found", "Wrong password"];

// Add Multiple Responses later

const edit_response_status = [200, 400, 400, 400];
const edit_response_body = [
  "Updated account details",
  "First name is mandatory",
  "Last name is mandatory",
  "Institution name is mandatory",
];

describe("POST /client/signin", () => {
  test("should login", async () => {
    await login_test_requisites();
    const promises = [];
    for (let i = 0; i < login.length; i++) {
      const user = login[i];

      const promise = await request(app)
        .post("/client/signin")
        .send(user)
        .then((response) => {
          expect(response.status).toBe(login_response_status[i]);

          if (response.status == 200) editor_jwt = response.body.jwt_token;

          if (
            login_response_status[i] == 500 ||
            login_response_status[i] == 400
          ) {
            expect(response.body.error).toEqual(login_response_body[i]);
          }
        });
      promises.push(promise);
    }
    // Wait for all requests to complete
    await Promise.all(promises);
  });
});
// #endregion

// #region Edit test cases

describe("POST /client/edit-account", () => {
  test("Edit account", async () => {
    // No need to add loop for the sign in here since we are testing the edit for the same user
    await login_test_requisites();
    const user = login[0];
    //const edit_user = edit_account[0];
    const promises = [];
    const promise = await request(app)
      .post("/client/signin")
      .send(user)
      .then((response) => {
        expect(response.status).toBe(login_response_status[0]);

        if (response.status == 200) editor_jwt = response.body.jwt_token;

        if (
          login_response_status[0] == 500 ||
          login_response_status[0] == 400
        ) {
          expect(response.body.error).toEqual(login_response_body[0]);
        }
      });
    promises.push(promise);

    // The Edit loop for the user that we logged in above starts here.
    for (let i = 0; i < edit_response_status.length; i++) {
      const edit_user = edit_account[i];
      const new_promise = await request(app)
        .post("/client/edit-account")
        .send(edit_user)
        .set("Authorization", `Bearer ${editor_jwt}`)
        .then((response) => {
          expect(response.status).toBe(edit_response_status[i]);
          if (
            login_response_status[i] == 500 ||
            login_response_status[i] == 400
          ) {
            expect(response.body.error).toEqual(edit_response_body[i]);
          }
        });

      promises.push(new_promise);
    }

    await Promise.all(promises);
  });
});

// #endregion

// // #region Author Signup by editor test cases
const signup_internal = [
  {
    username: "TestUser5",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe1@example.com",
    institution_name: "University A",
    pronoun: "he/him",
  },
  {
    username: "TestUser6",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe2@example.com",
    institution_name: "University A",
    pronoun: "he/him",
  },
  {
    username: "TestUser5",
    first_name: "John",
    last_name: "Doe",
    email: "different@example.com",
    institution_name: "University A",
    pronoun: "he/him",
  },
  {
    username: "Different",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe1@example.com",
    institution_name: "University A",
    pronoun: "he/him",
  },
  // Add more users as needed
];

const signup_internal_response_status = [200, 200, 500, 500];
const signup_internal_response_body = [
  "",
  "",
  "Duplicate entry 'TestUser5' for key 'clients.username'",
  "Duplicate entry 'john.doe1@example.com' for key 'clients.email'",
];

describe("POST /client/signup/Author", () => {
  test("should sign up if all authors if criteria meet and editor is signed in", async () => {
    await truncateTables();
    const promises = [];
    for (let i = 0; i < signup_internal.length; i++) {
      const user = signup_internal[i];

      const promise = await request(app)
        .post("/client/signup/Author")
        .send(user)
        .set("Authorization", `Bearer ${editor_jwt}`)
        .then((response) => {
          expect(response.status).toBe(signup_internal_response_status[i]);

          if (signup_internal_response_status[i] == 500) {
            expect(response.body.error).toEqual(
              signup_internal_response_body[i]
            );
          }
        });
      promises.push(promise);
    }
    // Wait for all requests to complete
    await Promise.all(promises);
  });
});
// #endregion

// #region Editor Signup by editor test cases
describe("POST /client/signup/Editor", () => {
  test("should sign up if all editors if criteria meet and editor is signed in", async () => {
    await truncateTables();
    const promises = [];
    for (let i = 0; i < signup_internal.length; i++) {
      const user = signup_internal[i];

      const promise = await request(app)
        .post("/client/signup/Editor")
        .send(user)
        .set("Authorization", `Bearer ${editor_jwt}`)
        .then((response) => {
          expect(response.status).toBe(signup_internal_response_status[i]);

          if (signup_internal_response_status[i] == 500) {
            expect(response.body.error).toEqual(
              signup_internal_response_body[i]
            );
          }
        });
      promises.push(promise);
    }
    // Wait for all requests to complete
    await Promise.all(promises);
  });
});
// #endregion

// #region Editorial Assistant Signup by editor test cases
describe("POST /client/signup/Editorial Assistant", () => {
  test("should sign up if all editorial assistant if criteria meet and editor is signed in", async () => {
    await truncateTables();
    const promises = [];
    for (let i = 0; i < signup_internal.length; i++) {
      const user = signup_internal[i];

      const promise = await request(app)
        .post("/client/signup/Editorial Assistant")
        .send(user)
        .set("Authorization", `Bearer ${editor_jwt}`)
        .then((response) => {
          expect(response.status).toBe(signup_internal_response_status[i]);

          if (signup_internal_response_status[i] == 500) {
            expect(response.body.error).toEqual(
              signup_internal_response_body[i]
            );
          }
        });
      promises.push(promise);
    }
    // Wait for all requests to complete
    await Promise.all(promises);
  });
});
// #endregion

// #region Reviewer Signup by editor test cases
describe("POST /client/signup/Reviewer", () => {
  test("should sign up if all reviewer if criteria meet and editor is signed in", async () => {
    await truncateTables();
    const promises = [];
    for (let i = 0; i < signup_internal.length; i++) {
      const user = signup_internal[i];

      const promise = await request(app)
        .post("/client/signup/Reviewer")
        .send(user)
        .set("Authorization", `Bearer ${editor_jwt}`)
        .then((response) => {
          expect(response.status).toBe(signup_internal_response_status[i]);

          if (signup_internal_response_status[i] == 500) {
            expect(response.body.error).toEqual(
              signup_internal_response_body[i]
            );
          }
        });
      promises.push(promise);
    }
    // Wait for all requests to complete
    await Promise.all(promises);
  });
});
// #endregion

// Run this after all tests complete
afterAll(async () => {
  await truncateTables();
});
