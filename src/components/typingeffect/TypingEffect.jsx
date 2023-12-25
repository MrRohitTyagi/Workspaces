import React, { useState, useEffect } from "react";
import "./typingeffect.css"; // Import your CSS file for styling

const TypingEffect = ({ text, time = 100, style }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setisDone] = useState(false);

  useEffect(() => {
    let index = 0;

    const typingInterval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index += 1;
      } else {
        setisDone(true);
        clearInterval(typingInterval);
      }
    }, time); // Adjust the interval based on your preference

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, time]);

  return (
    <div className="typing-effect" style={style}>
      {displayedText}
    </div>
  );
};

export default TypingEffect;
