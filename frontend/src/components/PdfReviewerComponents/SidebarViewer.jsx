import React from "react";
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

export function SidebarViewer({
  highlights,isEditor,setState
}) 
{
  const updateHash = (highlight) => {
    document.location.hash = `highlight-${highlight.id}`;
  };

  return (
    <div className="sidebar" style={{ width: "25vw" }}>
      <div className="description" style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>
          Manuscript View
        </h2>
      </div>

      <ul className="sidebar__highlights">
        {highlights.map((highlight, index) => (
          <li
            key={index}
            className="sidebar__highlight"
            onClick={() => {
              updateHash(highlight);
            }}
          >
            <div>
              <strong>{highlight.comment.text}</strong>
              
              {highlight.content.text ? (
                <blockquote style={{ marginTop: "0.5rem" }}>
                  {`${highlight.content.text.slice(0, 90).trim()}…`}
                </blockquote>
              ) : null}
              <small> Page {highlight.position.pageNumber} </small>
            </div>
            <div className="highlight__location">
                {highlight.commented_by?<p style={{ fontSize : "12px" }}>Commented by: {highlight.commented_by}</p>:null}
                {highlight.isOwner?<p style={{ fontSize : "20px" }}>🙋</p>:null}
                {isEditor?
                  <FormControlLabel
                  control={
                    <Switch checked={highlight.visible_to_author} onChange={()=>{setState(index)}} />
                  }
                  label="Visible to Author"
                />
                :null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
