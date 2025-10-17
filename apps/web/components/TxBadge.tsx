'use client';
import { useEffect, useState } from 'react';
import { Log } from '../lib/log';
export default function TxBadge(){
  const [tx,setTx]=useState<string| null>(null);
  useEffect(()=>{
    setTx(Log.getActiveTx?.()||null);
    const off=Log.on?.(()=> setTx(Log.getActiveTx?.()||null));
    return ()=> off && off();
  },[]);
  if(!tx) return null;
  return (<div style={{position:'fixed', top:8, right:12, zIndex:7000}}>
    <div className='pill' style={{background:'rgba(118,227,255,.95)', color:'#071019', fontWeight:900, borderColor:'rgba(118,227,255,.8)'}}>
      TX: {tx} <button className='btn' onClick={()=> Log.stopTx?.('manual')} style={{marginLeft:8}}>Stop</button>
    </div>
  </div>);
}
