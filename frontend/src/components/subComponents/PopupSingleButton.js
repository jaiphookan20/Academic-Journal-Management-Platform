import React from "react";
import "../Css/Popup.css";

export const PopupSingleButton = ({ title, text, button_text, button_listener }) => 
{ 
    return (    
        <div className="popup-container">     
            <div className="popup-body">      
                <h1>{title}</h1>      
                <h4>{text}</h4>
                <button onClick={button_listener}>{button_text}</button> 
            </div>    
        </div>  
    );
};