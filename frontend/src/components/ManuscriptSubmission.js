import React from 'react';
import Form from './Form'
import "./Css/Form.css";

export default function Manuscript_test() {
    const details = JSON.parse(sessionStorage.getItem("details"));
    let user_JWT_token = null;
    if(details)
        user_JWT_token = details.jwt_token;
    else
        window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self');
    if(!user_JWT_token)
        {
          window.open(`http://${process.env.REACT_APP_HOST}/Login`,'_self')
        }
        else if(!details.roles.includes(3))
        {
            window.open(`http://${process.env.REACT_APP_HOST}/PageDoesNotExist`,'_self')
        }
    return (
        <div className='container-form' style={{padding: '20px'}}>
            <Form/>
        </div>
    );
}