export default function LoadingOverlay({ onClick }) {
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
       <h2 style={{ color: 'white', margin:"30px"}}>First Binocular Prototype. <br/> Uses positional audio - works better with headphones. <br/> Pan by moving the mouse close to the edge.</h2> 
        <button onClick={onClick} style={{ padding: '10px 20px', fontSize: '16px' }}>Start Prototype</button>
      </div>
    );
  }