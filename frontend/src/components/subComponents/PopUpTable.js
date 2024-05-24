import React from "react";
import "../Css/PopupTable.css";

export const PopupTable = ({ title, content, button_listener }) => 
    {   
        const tableStyle = {
            margin: "40px auto",
            borderCollapse: "separate",
            borderSpacing: "0",
            overflow: "hidden",
            width: "100%",
            maxWidth: '100%',
            borderRadius: "8px",
        };
        const cellStyle = {
            background: "#fff",
            boxShadow: "2px 4px 8px rgba(0,0,0,0.1)",
            margin: "10px 0",
            padding: "10px",
            border: "0.2px #ccc",
            borderBottom: "1px solid #eeeeee",
        };

        const headerCellStyle = {
            ...cellStyle,
            background: "#f5f5f5",
            color: "#333",
            fontWeight: "bold",
            boxShadow: "2px 4px 8px rgba(0,0,0,0.1)",
        };
        let counter = 1;
        return (    
            <div className="popup-container">     
                <div className="popuptable-body">         
                    <h1>{title}</h1>
                    <table style={tableStyle}>
                            <thead>
                            <tr>
                            <th style={{ ...headerCellStyle, width: '2%' }}>No</th>
                            <th style={{ ...headerCellStyle, width: '20%' }}>Title</th>
                            <th style={{ ...headerCellStyle, width: '5%' }}>Submission ID</th>
                            <th style={{ ...headerCellStyle, width: '10%' }}>Submission Date and time</th>
                            <th style={{ ...headerCellStyle, width: '5%' }}>Submission Type</th>
                            <th style={{ ...headerCellStyle, width: '20%' }}>Abstract</th>
                            <th style={{ ...headerCellStyle, width: '10%' }}></th> 
                    </tr>
                            </thead>
                            <tbody>
                            {content.map((submission, index) => (
                            <tr key={index} style={{ background: "transparent" }}>
                                <td style={cellStyle}>{counter++}</td>
                                <td style={cellStyle}>{submission.submission_title}</td>
                                <td style={cellStyle}>{submission.submission_id}</td>
                                <td style={cellStyle}>{new Date(submission.submission_time).toLocaleString()}</td>
                                <td style={cellStyle}>{submission.submission_type}</td>
                                <td style={cellStyle}>{submission.abstract.length > 100 ?
                                `${submission.abstract.substring(0, 100)}...` :
                                submission.abstract
                                } </td>
                    <td style={cellStyle}><center><button className='popuptable-view-button' onClick={() => {
                                window.open(`http://${process.env.REACT_APP_HOST}/Submission-paper?submission_id=${submission.submission_id}&route_source=author-dashboard`, '_blank');
                            }}>Click To View</button></center></td>
                            </tr>
                            ))}
                            </tbody>
                        </table>
                    <button className="popup-close" onClick={button_listener}>Close</button>
                </div>    
            </div>  
        );
    };
