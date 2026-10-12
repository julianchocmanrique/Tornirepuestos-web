const { DatabaseSync, backup } = require('node:sqlite');
const { randomUUID } = require('node:crypto');
const { chmodSync } = require('node:fs');
const path = require('node:path');

async function main() {
  const hashes = JSON.parse(process.env.BAILE_TEST_PROFILE_HASHES || '{}');
  const definitions = [
    { username: 'superadmin', name: 'Superadministrador', role: 'superadmin' },
    { username: 'admin', name: 'Contratista del evento', role: 'contractor' },
    { username: 'participante1', name: 'Participante 1 (prueba)', role: 'participant' },
  ];
  for (const u of definitions) if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(hashes[u.username] || '')) throw new Error(`Falta hash válido para ${u.username}. No envíes contraseñas en texto plano.`);
  const directory = process.env.BAILE_DATA_DIR || path.join(process.cwd(), 'data', 'baile');
  const db = new DatabaseSync(path.join(directory, 'event.sqlite'));
  try {
    db.exec('PRAGMA busy_timeout=5000');
    if (!JSON.parse(db.prepare('SELECT data FROM state WHERE id=1').get().data).settings.demo) throw new Error('Las cuentas de prueba requieren modo de ejemplo.');
    const backupPath = path.join(directory, `before-test-profiles-${Date.now()}-${randomUUID()}.sqlite`);
    await backup(db, backupPath); chmodSync(backupPath, 0o600);
    db.exec('BEGIN IMMEDIATE');
    try {
      const s = JSON.parse(db.prepare('SELECT data FROM state WHERE id=1').get().data);
      if (!s.settings.demo) throw new Error('El modo de ejemplo fue desactivado.');
      for (const user of s.users) if (user.role === 'admin') user.role = 'superadmin';
      for (const item of definitions) {
        const id = `test-profile-${item.username}`, email = `${item.username}@ritmocaribe.test`;
        if (s.users.some(u => u.id !== id && (u.username?.toLowerCase() === item.username || u.email.toLowerCase() === email))) throw new Error(`El usuario ${item.username} ya pertenece a otra cuenta. No se reemplazó.`);
        const old = s.users.find(u => u.id === id);
        if (old && (old.role !== item.role || old.username !== item.username)) throw new Error('Conflicto con una cuenta existente.');
        const user = { id, ...item, demoOnly: true, email, passwordHash: hashes[item.username], categories: [] };
        if (old) Object.assign(old, user); else s.users.push(user);
        db.prepare('DELETE FROM sessions WHERE userId=?').run(id);
        if (item.role === 'participant' && !s.participants.some(p => p.id === id)) {
          if (s.participants.some(p => p.document === 'PRUEBAPARTICIPANTE1')) throw new Error('El documento de prueba ya existe.');
          s.participants.push({ id, code: `PAR-${String(s.participants.length + 1).padStart(4, '0')}`, name: item.name, email, document: 'PRUEBAPARTICIPANTE1', birthDate: '2000-01-01', phone: '0000000000', city: 'Ciudad de prueba', academy: 'Sin academia', extra: 'Cuenta ficticia para pruebas de permisos.', createdAt: new Date().toISOString(), fullPassFee: s.settings.fullPassFee });
        }
      }
      s.audit.push({ id: randomUUID(), actor: 'system', action: 'Perfiles de prueba configurados', target: 'evento', at: new Date().toISOString() });
      db.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(s)); db.exec('COMMIT');
      console.log('Perfiles de prueba configurados; respaldo SQLite creado. No se modificaron pagos ni calificaciones.');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  } finally { db.close(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
