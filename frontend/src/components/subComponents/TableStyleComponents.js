const tableStyle = {
    margin: "40px auto",
    borderCollapse: "separate",
    borderSpacing: "0",
    overflow: "hidden",
    width: "100%",
    borderRadius: "20px",
  };
  const cellStyle = {
    background: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    margin: "10px 0",
    padding: "10px",
    border: "none",
    position: "relative", // Added position relative to the cell style
  };

  const headerCellStyle = {
    ...cellStyle,
    background: "#f5f5f5",
    color: "#333",
    fontWeight: "bold",
    boxShadow: "none",
  };

  const saveButtonStyle = {
    position: "absolute",
    top: "50%",
    right: "5px",
    transform: "translateY(-50%)",
  };

  export {tableStyle,cellStyle,headerCellStyle,saveButtonStyle};