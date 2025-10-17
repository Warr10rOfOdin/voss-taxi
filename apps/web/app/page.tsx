export default function Page(){
  return (
    <div className="grid">
      <div className="card" style={{gridColumn:'span 12'}}>
        <div className="h1">Forside</div>
        <p>Vakter denne veka (kjem ittekvart) • Skuleruter i morgon • Chat</p>
      </div>
      <div className="card" style={{gridColumn:'span 6'}}>
        <div className="h1" style={{fontSize:20}}>Vakter denne veka</div>
        <div className="badge">Kjem ittekvart</div>
      </div>
      <div className="card" style={{gridColumn:'span 6'}}>
        <div className="h1" style={{fontSize:20}}>Skuleruter i morgon</div>
        <div className="badge">Ingen kombinasjon vald</div>
      </div>
      <div className="card" style={{gridColumn:'span 12'}}>
        <div className="h1" style={{fontSize:20}}>Chat (#voss-internt)</div>
        <div className="badge">Kjem ittekvart</div>
      </div>
    </div>
  );
}
