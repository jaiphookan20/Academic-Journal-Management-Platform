import React from "react";
import "./Css/Dashboard.css";
import "./Css/AssignUserDashboard.css";
import { useState } from "react";
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";
import { PopupDoubleButton } from "./subComponents/PopupDoubleButton.js";
import RefreshToken from './RefreshToken';
import Logout from "./Logout.js";

import { FaSearch } from "react-icons/fa";

const AssignRolesDashboard = () => {

  // Table styles
  const tableStyle = {
    margin: "40px auto",
    borderCollapse: "separate",
    borderSpacing: "0",
    overflow: "hidden",
    width: "100%",
    borderRadius: "8px",
  };
  const cellStyle = {
    background: '#fff',
    boxShadow: '2px 4px 8px rgba(0,0,0,0.1)',
    //borderRadius: '8px',
    margin: '10px 0',
    padding: '10px',
    border: 'none',
    borderBottom: "1px solid #eeeeee",
  };

  const headerCellStyle = {
    ...cellStyle,
    background: '#f5f5f5',
    color: '#333',
    fontWeight: 'bold',
    boxShadow: "2px 4px 8px rgba(0,0,0,0.1)",
  };


  const userDetails = JSON.parse(sessionStorage.getItem("details"));
  let user_JWT_token = null;
      if(userDetails)
        user_JWT_token = userDetails.jwt_token;
      else
        window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
    
  const user_roles = userDetails.roles;
  if (!user_roles.includes(1) && !user_roles.includes(2)) {
        window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`, '_self');
    }

  const string_to_role = {"Editor": 1, "Editorial Assistant": 2, "Author": 3, "Reviewer": 4};
  const role_to_string = {1: "Editor", 2: "Editorial Assistant", 3: "Author", 4: "Reviewer"};
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  //Pop up consts
  const [openSingle, setOpenSingle] = useState(false);
  const [success, setSuccess] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");
  const [logout, setLogout] = useState(false);
  const [openDouble, setOpenDouble] = useState(false);

  //Operation states
  const [Operation,setOperation] = useState(null)
  const [clientIDHandled,setClientIDHandled] = useState(null)
  const [roleHandled,setClientRoleHandled] = useState(null);
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = (event) => 
  {
    event.preventDefault();
    GetClientsData()
  };

  const GetClientsData = async () =>
  {   
      if (searchTerm === ""){
        setPopupTitle("Error");
        setPopupText("Please Enter a Name to search first");
        setOpenSingle(true);
        setSuccess(false);
        return;
      }
      let response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/get-clients-by-name/${searchTerm}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Authorization": `Bearer ${user_JWT_token}`,
          },
        });
      const res_data = await response.json();
      console.log(res_data);

      if (res_data.message === "jwt expired") 
      {
        setPopupTitle("Error");
        setPopupText("Login Expired. Please login again.");
        setOpenSingle(true);
        setSuccess(true);
        setLogout(true);
      } 
      else if (res_data.error) 
      {
        setPopupTitle("Error");
        setPopupText(res_data.error);
        setOpenSingle(true);
        setSuccess(false);
        return;
      } 
      else 
      {
        setClients(res_data);
      }
  }

  function handleRoleAssignment(clientID, roleID,clientName, clientRoles) 
  {
    setClientIDHandled(clientID);
    setClientRoleHandled(roleID);

    if (clientRoles.includes(roleID)) 
    {
      setOperation("Remove")
      setPopupText(`Are you sure you want to remove the role ${role_to_string[roleID]} from ${clientName}`);
    } 
    else 
    {
      setOperation("Add")
      setPopupText(`Are you sure you want to assign the role ${role_to_string[roleID]} to ${clientName}`);
    }
    setPopupTitle("Role Assignment Confirmation");
    setOpenDouble(true);
  }

  async function performOperation() 
  {
    setOpenDouble(false);

    if(Operation === "Add")
    {
      let item = {
        newUserId: clientIDHandled,
        role: role_to_string[roleHandled],
      };

      // console.log(item);
      let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/add-user-role`, {
        method: "POST",
        body: JSON.stringify(item),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user_JWT_token}`,
        },
      });
      const data = await result.json();
      
      console.log(data,"Add role response");
  
      if(data.error)
      {
        setPopupTitle("Error");
        setPopupText(data.error);
        setOpenSingle(true);
        setSuccess(false);
      }
      else
      {
        if(data.message === "jwt expired")
        {
          const loginRefreshStatus =  await RefreshToken();
          if(!loginRefreshStatus)
          {
            setPopupTitle("Login expired");
            setPopupText("Please try to login again from the home");
            setOpenSingle(true);
            setLogout(true);
            setSuccess(true);
          }
          else
          {
            user_JWT_token = loginRefreshStatus;
            console.log("Refreshing login")
            performOperation();
          }
        }
        else
        {
          setPopupTitle("Success!");
          setPopupText("Role has been added succesfully");
          setOpenSingle(true);
          setSuccess(false);
          const update_clients = clients;
          update_clients.forEach(element => {
            if(element.client_id === clientIDHandled)
            {  
              console.log("Coming here");
              element.roles.push(roleHandled);
            }
          });
          setClients(update_clients)
        }
      }
    }
    else
    {
      let item = {
        userId: clientIDHandled,
        role: role_to_string[roleHandled],
      };

      // console.log(item);
      let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/remove-user-role`, {
        method: "DELETE",
        body: JSON.stringify(item),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user_JWT_token}`,
        },
      });

      console.log(result,"Remove role response");
      const data = await result.json();
      
  
      if(data.error)
      {
        setPopupTitle("Error");
        setPopupText(data.error);
        setOpenSingle(true);
        setSuccess(false);
      }
      else
      {
        if(data.message === "jwt expired")
        {
          const loginRefreshStatus =  await RefreshToken();
          if(!loginRefreshStatus)
          {
            setPopupTitle("Login expired");
            setPopupText("Please try to login again from the home");
            setOpenSingle(true);
            setLogout(true);
            setSuccess(true);
          }
          else
          {
            user_JWT_token = loginRefreshStatus;
            console.log("Refreshing login")
            performOperation();
          }
        }
        else
        {
          setPopupTitle("Success!");
          setPopupText("Role has been removed succesfully");
          setOpenSingle(true);
          setSuccess(false);

          const update_clients = clients;
          update_clients.forEach(element => {
            if(element.client_id === clientIDHandled)
            {  
              const index = element.roles.indexOf(roleHandled);
              element.roles.splice(index, 1);
              console.log(element.roles)
            }
          });
          setClients(update_clients)
        }
      }
    }
  }

  return (
    <>
      <div className="dashboard-container">
      {openDouble ? 
        <PopupDoubleButton title={popupTitle} text={popupText}  button1_text={"Cancel"}  button1_listener={()=> {setOpenDouble(false)}}
         button2_text={"Confirm"} button2_listener={()=> performOperation()} />:null} 

      {openSingle ? (
          success ? (
            <PopupSingleButton
              title={popupTitle}
              text={popupText}
              button_text={"Close"}
              button_listener={() => 
              {
                if(logout)
                  Logout();
                else
                  window.location.href = "/";
              }}
            />
          ) : (
            <PopupSingleButton
              title={popupTitle}
              text={popupText}
              button_text={"Close"}
              button_listener={() => {
                setOpenSingle(false);
              }}
            />
          )
        ) : null}

        <center>
          <h1>Welcome to the Role Assignment Dashboard!</h1>
          <h4>Press on the assign/unassign buttons to assign/unassign specific roles.</h4>
          <div class="search-container">
          <p>You can search for Names below.</p>
          <center>
          <input
          type="text"
          className="search-input"
          placeholder="Search Users..."
          value={searchTerm}
          onChange={handleSearchChange}
          /></center></div>
          <button className="search-button" onClick={handleSearch}><FaSearch />  Search </button>
          
          
        <div className="table-responsive">
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...headerCellStyle, width: '2%' }}>Client ID</th>
            <th style={{ ...headerCellStyle, width: '15%' }}>Name</th>
            <th style={{ ...headerCellStyle, width: '15%' }}>Email</th>
            <th style={headerCellStyle}>Assign Roles</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((row, index) => (
            <tr key={index}>
              <td style={cellStyle}>{row.client_id}</td>
              <td style={cellStyle}>{row.first_name+" "+row.last_name}</td>
              <td style={cellStyle}>{row.email}</td>
              <td style={cellStyle}>
                <div className="assign-roles">
                  <button
                    className={`assignment-button ${row.roles.includes(string_to_role["Editor"]) ? "unassign-button" : "assign-button"}`}
                    onClick={() => handleRoleAssignment(row.client_id, string_to_role["Editor"], row.first_name+" "+row.last_name,row.roles)}
                  >
                    {row.roles.includes(string_to_role["Editor"]) ? "Unassign Editor" : "Assign Editor"}
                  </button>

                  <button
                    className={`assignment-button ${row.roles.includes(string_to_role["Editorial Assistant"]) ? "unassign-button" : "assign-button"}`}
                    onClick={() => handleRoleAssignment(row.client_id, string_to_role["Editorial Assistant"], row.first_name+" "+row.last_name,row.roles)}
                  >
                    {row.roles.includes(string_to_role["Editorial Assistant"]) ? "Unassign Editorial Assistant" : "Assign Editorial Assistant"}
                  </button>

                  <button
                    className={`assignment-button ${row.roles.includes(string_to_role["Author"]) ? "unassign-button" : "assign-button"}`}
                    onClick={() => handleRoleAssignment(row.client_id, string_to_role["Author"], row.first_name+" "+row.last_name,row.roles)}
                  >
                    {row.roles.includes(string_to_role["Author"]) ? "Unassign Author" : "Assign Author"}
                  </button>

                  <button
                    className={`assignment-button ${row.roles.includes(string_to_role["Reviewer"]) ? "unassign-button" : "assign-button"}`}
                    onClick={() => handleRoleAssignment(row.client_id, string_to_role["Reviewer"], row.first_name+" "+row.last_name,row.roles)}
                  >
                    {row.roles.includes(string_to_role["Reviewer"]) ? "Unassign Reviewer" : "Assign Reviewer"}
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      </div>
        </center>
      </div>

    </>
  );
};

export default AssignRolesDashboard;
