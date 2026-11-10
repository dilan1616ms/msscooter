/* MS Scooter — builds the MS_REP entry fields needed by the new passport (node seal-passport.js)
   Usage:  const {sealRep} = require('./seal-passport.js');
           sealRep({ s:'SERIAL', code:'ABCD1234',            // owner tracking code (old way, still works)
                     id:{ln,fn,sex:'m'|'f',bd:'YYYY-MM-DD',pob,wil,idn:'full ID number'},
                     rcp:{d:{...receipt data}, q:'qr url'} })
   Returns { s, salt, blob, ik:{salt,blob}, h:{ln,fn,sx,wil,idl,bd,pob} }  -> merge into your MS_REP entry.
   h  is PUBLIC: full surname, given names, sex, wilaya, last 3 chars of the ID number ; birth date/place stay half-masked.
   ik is sealed with the FULL ID number : the client types it, then the fingerprint step opens the passport. */
const c = require('crypto');
const nc = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function seal(code, obj) {
  const salt = c.randomBytes(16), iv = c.randomBytes(12), bits = c.pbkdf2Sync(nc(code), salt, 40000, 64, 'sha256'), ek = bits.subarray(0, 32), mk = bits.subarray(32);
  const pt = Buffer.from(JSON.stringify(obj), 'utf8'), ct = Buffer.alloc(pt.length);
  for (let i = 0; i < Math.ceil(pt.length / 32); i++) { const n = Buffer.alloc(4); n.writeUInt32BE(i); const k = c.createHmac('sha256', ek).update(Buffer.concat([iv, n])).digest(); for (let j = 0; j < 32 && i * 32 + j < pt.length; j++) ct[i * 32 + j] = pt[i * 32 + j] ^ k[j]; }
  const tag = c.createHmac('sha256', mk).update(Buffer.concat([iv, ct])).digest();
  return { salt: salt.toString('hex'), blob: Buffer.concat([iv, ct, tag]).toString('base64url') };
}
const half = w => { const q = Array.from(String(w || '')), k = q.length > 1 ? Math.ceil(q.length / 2) : 0; return q.slice(0, k).join('') + '•'.repeat(q.length - k); };
function sealRep(o) {
  const id = Object.assign({}, o.id); id.idl = nc(id.idn).slice(-3);
  const payload = { id, rcp: o.rcp || null }, a = seal(o.code, payload), b = seal(id.idn, payload);
  return { s: o.s, salt: a.salt, blob: a.blob, ik: b,
    h: { ln: id.ln, fn: id.fn, sx: id.sex, wil: id.wil, idl: id.idl, bd: half(id.bd), pob: half(id.pob) } };
}
module.exports = { sealRep, seal };
