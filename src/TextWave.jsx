import React from 'react';
import './TextWave.css'; // Assuming you have a CSS file for styles

const TextWave = ({ text }) => {
  return (
    <h1 className="word">
      {text.split('').map((char, index) => (
        <span key={index} style={{ animationDelay: `${index * 0.1}s` }} className="wave">
          {char}
        </span>
      ))}
    </h1>
  );
};

export default TextWave;