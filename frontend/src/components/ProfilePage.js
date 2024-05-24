import React, { useState } from "react";
import "./Css/EditInformation.css";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";


const userDetails = JSON.parse(sessionStorage.getItem("details"));
const ProfilePage = () => {
  const [profile, setProfile] = useState({
    titleId: "16",
    firstName: userDetails.first_name,
    lastName: userDetails.last_name,
    email: userDetails.email,
    orcid: userDetails.orcid
      ? userDetails.orcid
      : "PLEASE UPDATE ORCID From the Update Button Below",
    pronouns: userDetails.pronoun,
    institution: userDetails.institution_name,
    //instead need to get data from the server
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(profile);
    // send data to a server need to be added
  };


  return (
    <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
      <Typography style={{ textAlign: "center" }} variant="h5" gutterBottom>
        <b>Profile Information</b>
      </Typography>

      <form onSubmit={handleSubmit}> 

        <TextField
          margin="normal"
          fullWidth
          label="First Name"
          name="firstName"
          value={profile.firstName}
          onChange={handleChange}
          disabled
        />
        <TextField
          margin="normal"
          fullWidth
          label="Last Name"
          name="lastName"
          value={profile.lastName}
          onChange={handleChange}
          disabled
          InputProps={{ style: { color: 'black' } }} 
        />
        <TextField
          margin="normal"
          fullWidth
          label="Email ID"
          name="email"
          value={profile.email}
          onChange={handleChange}
          disabled
        />
        <TextField
          margin="normal"
          fullWidth
          label="ORCID ID"
          name="orcid"
          value={profile.orcid}
          onChange={handleChange}
          disabled
        />
        <TextField
          margin="normal"
          fullWidth
          label="pronouns"
          name="pronouns"
          value={profile.pronouns}
          onChange={handleChange}
          disabled
        />
        <TextField
          margin="normal"
          fullWidth
          label="Institution"
          name="institution"
          value={profile.institution}
          onChange={handleChange}
          disabled
        />

        <Box mt={2} style={{ textAlign: "center" }}>
        <Link
            className="nav-link active"
            aria-current="page"
            to="/edit-account-details"
          >
          <Button variant="contained" color="primary" type="submit">
            Edit Information
          </Button>
        </Link>
        </Box>
      </form>
    </Container>
  );
};

export default ProfilePage;
