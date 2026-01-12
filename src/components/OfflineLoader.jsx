import React from 'react';

export default function OfflineLoader() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
      <div style={{padding:24,borderRadius:8,background:'#fff',boxShadow:'0 6px 18px rgba(0,0,0,0.06)',textAlign:'center'}}>
        <h3>Loading local data…</h3>
        <p style={{color:'#666',marginTop:8}}>Preparing offline cache — please wait.</p>
      </div>
    </div>
  );
}
