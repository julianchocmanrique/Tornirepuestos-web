import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {createServer} from 'node:net';

test('Fotos de jurados: permisos, imagen segura, perfiles y aislamiento', {timeout:90000}, async t=>{
  const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
  const root=`http://127.0.0.1:${port}`,env={...process.env,BAILE_DATA_DIR:mkdtempSync(path.join(tmpdir(),'rankia-judge-photo-')),NODE_ENV:'production'};
  const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port)],{env,stdio:'ignore'});t.after(()=>server.kill('SIGTERM'));
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(root+'/api/baile/public')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready);
  const credentials=JSON.parse(execFileSync(process.execPath,['scripts/baile-admin.cjs'],{env,encoding:'utf8'}));
  function client(event='encuentro-salsa') {let cookie='';const base=root+'/api/baile/eventos/'+event;return {
    async post(action,fields={},status=200,origin=root){const body=new FormData();for(const [k,v]of Object.entries(fields))body.set(k,v);const r=await fetch(base+'/'+action,{method:'POST',headers:{origin,cookie},body});const d=await r.json();assert.equal(r.status,status,`${action}: ${JSON.stringify(d)}`);if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return d;},
    async get(action='snapshot'){return fetch(base+'/'+action,{headers:{cookie}});}
  };}
  const admin=client(),guest=client(),judge=client(),other=client('encuentro-bachata');await admin.post('login',credentials);
  await admin.post('judge',{id:'',name:'Jurado Foto',email:'foto@judge.test',password:'JuradoFoto1234'});
  await admin.post('judge',{id:'',name:'Otro Jurado',email:'otro@judge.test',password:'OtroJurado1234'});
  const before=await(await admin.get()).json(),target=before.judges.find(j=>j.email==='foto@judge.test'),otherJudge=before.judges.find(j=>j.email==='otro@judge.test');
  const buffer=await sharp({create:{width:900,height:600,channels:3,background:'#8a1b2c'}}).jpeg().toBuffer();
  await admin.post('judge',{id:'',name:'Invalid',email:'invalid@judge.test',password:'InvalidPhoto1234',photo:new File(['bad'],'bad.png')},400);
  assert.ok(!(await(await admin.get()).json()).judges.some(j=>j.email==='invalid@judge.test'));
  await admin.post('judge',{id:'',name:'With photo',email:'with@judge.test',password:'WithPhoto1234',photo:new File([buffer],'photo.jpg')});
  let created=(await(await admin.get()).json()).judges.find(j=>j.email==='with@judge.test');
  const initialId=created.photoId;assert.ok(initialId);assert.equal((await guest.get('judge-photo/'+initialId)).status,200);
  await admin.post('judge',{id:created.id,name:'Updated name',email:created.email,password:'',photo:new File([],'')});
  assert.equal((await(await admin.get()).json()).judges.find(j=>j.id===created.id).photoId,initialId);
  await admin.post('judge',{id:created.id,name:'Updated name',email:created.email,password:'',photo:new File([buffer],'new.jpg')});
  created=(await(await admin.get()).json()).judges.find(j=>j.id===created.id);assert.notEqual(created.photoId,initialId);
  assert.equal((await guest.get('judge-photo/'+initialId)).status,404);
  const fields=()=>({judgeId:target.id,file:new File([buffer],'foto.jpg',{type:'image/jpeg'})});
  await guest.post('judge-photo',fields(),401);
  await judge.post('login',{email:'foto@judge.test',password:'JuradoFoto1234'});
  await judge.post('judge-photo',{...fields(),judgeId:otherJudge.id},403);
  await judge.post('judge-photo',fields(),403,'https://otro.test');
  await judge.post('judge-photo',{judgeId:target.id,file:new File(['<svg/>'],'foto.jpg')},400);
  await judge.post('judge-photo',{judgeId:target.id,file:new File([new Uint8Array(5*1024**2+1)],'grande.jpg')},400);
  await judge.post('judge-photo',fields());
  let own=await(await judge.get()).json();assert.ok(own.user.photoId);assert.equal(own.user.role,'judge');
  const photoId=own.user.photoId,response=await guest.get('judge-photo/'+photoId);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/webp');assert.equal(response.headers.get('cache-control'),'no-store');
  const metadata=await sharp(Buffer.from(await response.arrayBuffer())).metadata();assert.equal(metadata.width,512);assert.equal(metadata.height,512);assert.equal(metadata.exif,undefined);
  assert.equal((await other.get('judge-photo/'+photoId)).status,404);
  assert.equal((await guest.get('judge-photo')).status,404);
  const profiles=await(await judge.get('profiles')).json();assert.equal(profiles.profiles.find(p=>p.id===target.id).photoId,photoId);
  const after=await(await admin.get()).json();assert.deepEqual(after.scores,before.scores);assert.deepEqual(after.enrollments,before.enrollments);assert.equal(after.judges.find(j=>j.id===target.id).photoId,photoId);
  await admin.post('judge-photo',fields());own=await(await judge.get()).json();assert.notEqual(own.user.photoId,photoId);assert.equal((await guest.get('judge-photo/'+photoId)).status,404);
  await judge.post('judge-photo-remove',{judgeId:otherJudge.id},403);
  await judge.post('judge-photo-remove',{judgeId:target.id});assert.equal((await(await judge.get()).json()).user.photoId,undefined);
});
