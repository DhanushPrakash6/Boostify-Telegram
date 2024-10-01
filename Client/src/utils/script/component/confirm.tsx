import { useState } from "react";
import "./confirm.css";

const Confirm = ({ text, onClick }) => {
  const [clicked, setClicked] = useState(false);

  const handleButtonClick = (e) => {
    setClicked(true);

    if (onClick) {
      onClick(e); 
    }

    setTimeout(() => {
      setClicked(false);
    }, 1200); 
  };

  return (
    <button
      onClick={handleButtonClick}
      className={`btn ${clicked ? "clicked" : ""}`} 
    >
      {text}
    </button>
  );
};

export default Confirm;
