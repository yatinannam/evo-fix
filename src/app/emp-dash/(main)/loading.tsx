export default function EmpDashLoading() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '32px'
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, minWidth: '250px', height: '120px',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.7)',
            animation: 'pulse 1.5s infinite',
          }} />
        ))}
      </div>
      <div style={{
        width: '100%', height: '400px',
        background: 'rgba(255,255,255,0.5)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.7)',
        animation: 'pulse 1.5s infinite',
      }} />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}} />
    </div>
  );
}
