import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import CatchTheLeopard from './CatchTheLeopard';
import WheelApp from './WheelApp';
import DragTest from './DragTest';
import AnimState from './animState';
import PositionLock from './positionLock';
import AnimOncePosition from './animeOncePosition';
import MixamoOutline from './mixamo_outlines';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MixamoOutline />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
