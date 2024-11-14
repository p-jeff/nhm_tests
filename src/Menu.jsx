import React, { useState } from 'react';
import './Menu.css'; // Create a CSS file for styling

const Menu = ({ handleButtonClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`menu ${isHovered ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <ul>
          <li><h2> Full interaction Prototypes </h2></li>
          <li><button onClick={() => handleButtonClick('/mixamo-outline')}>Mixamo animation with Outline</button></li>
          <li><button onClick={() => handleButtonClick('/scan')}>Scan</button></li>
          <li><h2> WIP </h2></li>
          <li><button onClick={() => handleButtonClick('/lines-or-planes')}>Lines or Planes</button></li>
          <li><button onClick={() => handleButtonClick('/dynamic-outline')}>Dynamic Outline</button></li>
          <li><h2> Steps, small bits </h2></li>
          <li><button onClick={() => handleButtonClick('/audio-test')}>Audio Test</button></li>
          <li><button onClick={() => handleButtonClick('/catch-the-leopard')}>Move model on close to view center</button></li>
          <li><button onClick={() => handleButtonClick('/drag-test')}>Large Wheel Drag Test</button></li>
          <li><button onClick={() => handleButtonClick('/anim-state')}>Anim State</button></li>
          <li><button onClick={() => handleButtonClick('/position-lock')}>Position Lock</button></li>
          <li><button onClick={() => handleButtonClick('/anim-once-position')}>Anim Once Position</button></li>
          <li><button onClick={() => handleButtonClick('/wheel-app')}>Wheel App</button></li>
        </ul>
      ) : (
        <button className="menu-button">Menu</button>
      )}
    </div>
  );
};

export default Menu;