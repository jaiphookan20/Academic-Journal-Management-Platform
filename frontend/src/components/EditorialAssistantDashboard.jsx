import React, { useState, useEffect, useCallback } from "react";
import "./Css/Dashboard.css";
import { tableStyle, cellStyle, headerCellStyle, saveButtonStyle } from './subComponents/TableStyleComponents.js';
import { PopupSingleButton } from "./subComponents/PopupSingleButton.js";
import { MdOutlineModeEdit } from "react-icons/md";
import RefreshToken from './RefreshToken';
import Logout from "./Logout.js";

const EditorialAssistantDashboard = () => {
  let user_JWT_token = null;
  let userDetails = JSON.parse(sessionStorage.getItem("details"));
  let user_roles = null

  if(userDetails)
  {
    user_JWT_token = userDetails.jwt_token;
    user_roles = userDetails.roles;
  }

  if(!user_JWT_token)
    {
      window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
    }
    else if(!user_roles.includes(2))
    {
        window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`,'_self')
    }


  const [editorInfo, seteditorInfo] = useState([]);
  const [unassigned_submissions, setUnassigned_submissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logout, setLogout] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Sample Popup Title");
  const [popupText, setPopupText] = useState("Sample Popup Text");
  const [selectedEditor, setselectedEditor] = useState([]);
  const [editModeStatus, seteditModeStatus] = useState([]); // Track which row is in edit mode
  const [editComplete, seteditComplete] = useState([]); // Track which row has completed edit

  const initialise_editor_list = useCallback(async () => {
    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/get-editors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${user_JWT_token}`,
      },
    });

    result = await result.json();
    console.log(result, "Get editors response");

    if (result.error) {
      setPopupTitle("Error");
      setPopupText(result.error);
      setOpen(true);
      setSuccess(false);
    } else {
      if (result.message === "jwt expired") {
        setPopupTitle("Login expired");
        setPopupText("Please try to login again from the home");
        setOpen(true);
        setLogout(true);
        setSuccess(true);
      } else {
        const fetch_editor_names = []
        result.forEach(element => {
          fetch_editor_names.push({ name: element.first_name + " " + element.last_name, editor_id: element.client_id });
        });
        seteditorInfo(fetch_editor_names);
      }
    }
  }, [user_JWT_token]);

  const unassigned_submissions_list = useCallback(async () => {
    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/editorial-decisions/get-all-unassigned-submissions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${user_JWT_token}`,
      },
    });

    result = await result.json();

    console.log(result, "Submission response");
    if (result.error) {
      setPopupTitle("Error");
      setPopupText(result.error);
      setOpen(true);
      setSuccess(false);
    } else {
      if (result.message === "jwt expired") {
        setPopupTitle("Login expired");
        setPopupText("Please try to login again from the home");
        setOpen(true);
        setLogout(true);
        setSuccess(true);
      } else {
        setUnassigned_submissions(result);
        // Initialising state variables with default values for every submission
        const editors_current = [];
        const edit_mode_status_current = [];
        const edit_complete_current = [];
        result.forEach((element) => {
          const new_element = {};
          new_element.editor_id = null;
          new_element.name = "None";
          new_element.submission_id = element.submission_id;
          editors_current.push(new_element);
          edit_mode_status_current.push(false);
          edit_complete_current.push(false);
        });
        setselectedEditor(editors_current);
        seteditModeStatus(edit_mode_status_current);
        seteditComplete(edit_complete_current);
      }
    }
  }, [user_JWT_token]);

  useEffect(() => {
    initialise_editor_list();
    unassigned_submissions_list();
  }, [initialise_editor_list, unassigned_submissions_list]);

  const handleEditorDropdownChange = (index, editor_name) => {
    editorInfo.forEach(element => {
      if (element.name === editor_name) {
        const changed_element = { name: editor_name, editor_id: element.editor_id, submission_id: selectedEditor[index].submission_id };
        setselectedEditor({ ...selectedEditor, [index]: changed_element });
      }
    });
  };

  const handleEditButton = (index) => {
    seteditModeStatus({ ...editModeStatus, [index]: true });
    // Setting the default value of the dropdown
    handleEditorDropdownChange(index, editorInfo[0].name);
  };

  const handleSaveButton = async (index) => {
    let item = { submission_id: selectedEditor[index].submission_id, editor_id: selectedEditor[index].editor_id };
    console.log(item, "body");
    let result = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/editorial-decisions/assign-submission`, {
      method: "POST",
      body: JSON.stringify(item),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${user_JWT_token}`,
      },
    });

    const data = await result.json();
    console.log(data, "Assign editor response");

    if (data.error) {
      setPopupTitle("Error");
      setPopupText(data.error);
      setOpen(true);
      setSuccess(false);
    } else {
      if (data.message === "jwt expired") {
        const loginRefreshStatus = await RefreshToken();
        if (!loginRefreshStatus) {
          setPopupTitle("Login expired");
          setPopupText("Please try to login again from the home");
          setOpen(true);
          setLogout(true);
          setSuccess(true);
        } else {
          user_JWT_token = loginRefreshStatus;
          console.log("Refreshing login");
          handleSaveButton(index);
        }
      } else {
        const submission_updated = unassigned_submissions;
        submission_updated[index].status = "Under Primary Review";
        seteditModeStatus({ ...editModeStatus, [index]: false });
        seteditComplete({ ...editComplete, [index]: true });
        setUnassigned_submissions(submission_updated);
        setPopupTitle("Success!");
        setPopupText("Editor has been assigned");
        setOpen(true);
        setSuccess(false);
      }
    }
  };

  return (
    <>
      <div className="dashboard-container">
        <center>
          <h1>Welcome to your Editorial Assistant Dashboard!</h1>
          <h4>You can Assign New Editors to Unassigned Submissions here.</h4>

          <div className="table-responsive">
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Submission ID</th>
                  <th style={headerCellStyle}>Article Title</th>
                  <th style={headerCellStyle}>Submitted By</th>
                  <th style={headerCellStyle}>Editor Name</th>
                  <th style={headerCellStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {unassigned_submissions.map((row, index) => (
                  <tr key={index} style={{ background: "transparent" }}>
                    <td style={cellStyle}>{row.submission_id}</td>
                    <td style={cellStyle}>{row.submission_title}</td>
                    <td style={cellStyle}>{row.author_id}</td>
                    <td style={cellStyle}>
                      {editModeStatus[index] ?
                        (<div>
                          <select
                            value={selectedEditor[index].name || ''}
                            onChange={(e) => {
                              handleEditorDropdownChange(index, e.target.value);
                            }}>
                            {editorInfo.map((editor, idx) => (
                              <option key={idx} value={editor.name}>{editor.name}</option>
                            ))}
                          </select>
                          <button
                            className="saveButton"
                            style={saveButtonStyle}
                            onClick={() => handleSaveButton(index)}
                          >
                            Save
                          </button>
                        </div>
                        )
                        :
                        (!editComplete[index]
                          ? (<>
                            <div className="editButtonContainer">
                              <div>{selectedEditor[index].name}</div>
                              <button className="editButton" onClick={() => { handleEditButton(index); }}>
                                <MdOutlineModeEdit />
                              </button>
                            </div>
                          </>)
                          : <div className="editButtonContainer">
                            <div>{selectedEditor[index].name}</div>
                          </div>)}
                    </td>
                    <td style={cellStyle}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {open ?
            (success ? (
              <PopupSingleButton
                title={popupTitle}
                text={popupText}
                button_text={"Close"}
                button_listener={() => {
                  if (logout)
                    Logout();
                  else
                    window.location.href = "/";
                }}
              />)
              :
              (<PopupSingleButton
                title={popupTitle}
                text={popupText}
                button_text={"Close"}
                button_listener={() => { setOpen(false); }}
              />))
            : null}
        </center>
      </div>
    </>
  );
};

export default EditorialAssistantDashboard;