// BackButton.jsx
const BackButton = ({ onClick }) => (
  <button 
    onClick={onClick}
    style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      padding: '8px 16px',
      zIndex: 1000,
      minWidth: 'auto'
    }}
  >
    ←
  </button>
);

export default BackButton;