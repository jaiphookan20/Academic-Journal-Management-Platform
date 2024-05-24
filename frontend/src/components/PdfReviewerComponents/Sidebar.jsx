import React from "react";

const updateHash = (highlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};



export function Sidebar({
  highlights,
  deleteHighlight
}) {
  return (
    <div className="sidebar" style={{ width: "25vw" }}>
      <div className="description" style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>
          Manuscript Review
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
              <button
                onClick={(e) => {
                  e.stopPropagation(); // To prevent the onClick of the li element from firing
                  console.log("Clicking delete",highlight)
                  deleteHighlight(highlight); 
                }}
              >
                🗑️
              </button>
                
            </div>
            
          </li>
        ))}
      </ul>
    </div>
  );
}
