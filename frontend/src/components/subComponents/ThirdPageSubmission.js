import "../Css/ThirdPageSubmission.css";
import React, { useState } from 'react';
import { MdDelete } from 'react-icons/md'; 

export default function ThirdPageSubmission({ setFiles,setFileDescriptions}) 
{
  const [filesLocal, setFilesLocal] = useState([]);
  const [fileDescriptionsLocal, setFileDescriptionsLocal] = useState([])
  let tempFile = null;
  let tempDescription = '';

  const setTempFile = (file) => {tempFile = file;}
  const setTempDescription = (file_description) => {tempDescription = file_description;}

  const addFile = (file,fileDescription) => 
  {
    if(file && fileDescription)
    {
      // Adding newly added file to files array
      const filesLocalCurrent = filesLocal;
      filesLocalCurrent.push(file);

      // Adding newly added descriptions to file_description array
      const fileDescriptionsLocalCurrent = fileDescriptionsLocal;
      const tempFileDesc = {"file_description":fileDescription};
      fileDescriptionsLocalCurrent.push(tempFileDesc);

      setFilesLocal(filesLocalCurrent);
      setFileDescriptionsLocal(fileDescriptionsLocalCurrent);
  
      setFiles(filesLocal);
      setFileDescriptions(JSON.stringify(fileDescriptionsLocal));
    }
  }

  const removeFile = (index) => 
  {
    setFilesLocal(filesLocal.filter((_, idx) => idx !== index));
    setFileDescriptionsLocal(fileDescriptionsLocal.filter((_, idx) => idx !== index));
    setFiles(filesLocal);
    setFileDescriptions(fileDescriptionsLocal);
  };

  return (
    <div className="upload-container">
      <div className="upload-section">
        <h1 className="upload-header"><b>Upload Manuscript File</b></h1>
        <input
          className="file-input"
          type='file'
          onChange={e => {addFile(e.target.files[0],"Anonymised Manuscript");}}
        />
      </div>

      <div className="upload-section">
        <h1 className="upload-header"><b>Upload Another file</b></h1>
        <p >Maximum Single File size is 5mb</p>
        <p >Allowed File types are JPEG,PNG,JPG,PDF,DOC,DOCX</p>
        <h3 className="upload-header"><b>Click on add file after providing a description and selecting file</b></h3>
        <input
          className="document-type-input"
          type="text"
          onChange={e => {setTempDescription(e.target.value)}}
          placeholder="Enter document type"
        />
        <input
          className="file-input"
          type='file'
          onChange={e =>{setTempFile(e.target.files[0])}}
        />
        <button className="add-file" onClick={()=> {addFile(tempFile,tempDescription)}} >Add File</button>
      </div>

      {filesLocal.length > 0 && (
        <table className="files-table">
          <thead>
            <tr>
              <th>Document Type</th>
              <th>File Name and Action</th>
            </tr>
          </thead>
          <tbody>
            {filesLocal.map((file, index) => (
              <tr key={index}>
                <td>{fileDescriptionsLocal[index].file_description}</td>
                <td>
                  {file.name}
                  <button onClick={() => removeFile(index)} style={{ border: 'none', background: 'transparent', marginLeft: '10px' }}>
                    <MdDelete size="1.5em" style={{color:'#6f141b'}}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}