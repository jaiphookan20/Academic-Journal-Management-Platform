import React from "react";
import "../Css/Popup.css";

export const PopupDoubleButton = ({ title, text, button1_text, button1_listener, button2_text, button2_listener }) => 
{ 
    return (    
        <div className="popup-container">     
            <div className="popup-body">      
                <h1>{title}</h1>      
                <h4>{text}</h4>
                <button onClick={button1_listener}>{button1_text}</button> 
                <button onClick={button2_listener}>{button2_text}</button> 
            </div>    
        </div>  
    );
};