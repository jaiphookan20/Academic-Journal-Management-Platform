const request = require("supertest");
const app = require("../../server.js");
const truncateTables = require("../utilities/truncate.tables.js");
const { generate_refresh_token } = require("../utilities/manage.token.js");
const { Refresh_Token_Model } = require("../models/client.model.js");

async function signUpAuthor() 
{
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

beforeAll(async () => 
{
  await truncateTables();
});

describe("POST /client/login-refresh", () => 
{
  beforeEach(async () => {
    await signUpAuthor();
  });

  test("should fail when using an invalid refresh token that doesn't exist in the table", async () => {
    const ip_address = "::ffff:127.0.0.1";
    const user = {
      client_id: 1,
      refresh_token:
        "4f1e19235e092933da25b683210af2cb8ca0fbbbc851aa55290d161fc7247e307bd8ce2826dffae3x",
      ip_address: ip_address,
      new_refresh_token: generate_refresh_token(ip_address),
    };

    const promise = await request(app)
      .post("/client/login-refresh")
      .send(user)
      .then((response) => {
        expect(response.body.error).toEqual(
          "Invalid token. Please login with username and password again"
        );
      });
  });

  test("should succeed when using a valid refresh token that exists in the table", async () => {
    const client_id = 1;
    const ip_address = "::ffff:127.0.0.1";

    let refresh_token = null;

    /* fetching the refresh token from the database */
    await Refresh_Token_Model.findOne({
      where: { client_id: client_id },
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    })
    .then((refreshToken) => 
    {
      if (refreshToken) 
      {
        refresh_token = refreshToken.dataValues.refresh_token;
      } 
      else 
      {
        throw new Error("No refresh token found for client_id: " + client_id);
      }
    })
    .catch((error) => 
    {
      console.error("Error:", error);
      result(error, null);
    });

    const user = 
    {
      client_id: client_id,
      refresh_token: refresh_token,
      ip_address: ip_address,
      new_refresh_token: generate_refresh_token(ip_address),
    };

    const promise = await request(app)
      .post("/client/login-refresh")
      .send(user)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.error).toEqual(undefined);
      });
  });

  test("should fail when using a valid refresh token that is past expiry", async () => 
  {
    const client_id = 1;
    const ip_address = "::ffff:127.0.0.1";

    // Fetch a valid refresh token and modify it to be expired
    let refresh_token = null;
    await Refresh_Token_Model.findOne({
      where: { client_id: client_id },
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    })
    .then((refreshToken) => 
    {
      if (refreshToken) 
      {
        refresh_token = refreshToken.dataValues.refresh_token;
      } 
      else 
      {
        throw new Error("No refresh token found for client_id: " + client_id);
      }
    })
    .catch((error) => 
    {
      console.error("Error:", error);
      result(error, null);
    });

    const pastValidFrom = new Date();
    pastValidFrom.setDate(pastValidFrom.getDate() - 40); // Setting 'valid_from' 40 days in the past

    await Refresh_Token_Model.update({ valid_from: pastValidFrom },{where: {refresh_token: refresh_token }});

    const user = 
    {
      client_id: client_id,
      refresh_token: refresh_token,
      ip_address: ip_address,
      new_refresh_token: generate_refresh_token(ip_address),
    };

    const response = await request(app)
      .post("/client/login-refresh")
      .send(user);

    expect(response.status).toBe(400);
    console.log("response.body.error: " + response.body.error);
    expect(response.body.error).toContain("Token expired or revoked");
  });
});
