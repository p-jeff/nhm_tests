// Menu.jsx
const Menu = ({ handleButtonClick }) => {
  const menuItems = [
    { path: '/mixamo-outline', label: 'Mixamo Outline' },
    { path: '/scan', label: 'Scan' },
    { path: '/lines-or-planes', label: 'Lines or Planes' },
    { path: '/dynamic-outline', label: 'Dynamic Outline' },
    { path: '/audio-test', label: 'Audio Test' },
    { path: '/catch-the-leopard', label: 'Catch the Leopard' },
    { path: '/drag-test', label: 'Drag Test' },
    { path: '/anim-state', label: 'Animation State' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {menuItems.map((item) => (
        <button 
          key={item.path}
          onClick={() => handleButtonClick(item.path)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Menu;