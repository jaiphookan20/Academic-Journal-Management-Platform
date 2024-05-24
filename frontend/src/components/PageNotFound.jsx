import React from 'react'
import { Link } from 'react-router-dom';
import "./Css/PageNotFound.css";

const PageNotFound = () => {
  return (
    <div>
      <>
    <div className="section" style={{textAlign:"center"}}>
  <h1 className="error">404</h1>
  <div className="page">Ooops!!! The page you are looking for is not found</div>
  <Link className="nav-link active" aria-current="page" to="/"><button className='back-button'>Back to home</button></Link>
</div>
    </>
    </div>
  )
}

export default PageNotFound
