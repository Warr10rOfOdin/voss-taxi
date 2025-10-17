#!/usr/bin/env node
const fs=require('fs'), path=require('path');
function copyDir(src,dst){
  fs.mkdirSync(dst,{recursive:true});
  for(const n of fs.readdirSync(src,{withFileTypes:true})){
    const s=path.join(src,n.name), d=path.join(dst,n.name);
    if(['node_modules','.next','.git','releases'].includes(n.name)) continue;
    if(n.isDirectory()) copyDir(s,d); else fs.copyFileSync(s,d);
  }
}
const outBase=process.argv[2]||'releases';
const ts=new Date().toISOString().replace(/[:.]/g,'-');
const dest=path.join(outBase, ts+'-snapshot');
console.log('> Snapshot to', dest);
copyDir(process.cwd(), dest);
console.log('> Done.');
