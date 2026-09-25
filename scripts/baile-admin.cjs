const { DatabaseSync } = require('node:sqlite');
const { randomUUID, randomBytes, scryptSync } = require('node:crypto');
const { existsSync } = require('node:fs');
const path = require('node:path');

const file = path.join(process.env.BAILE_DATA_DIR || path.join(process.cwd(), 'data', 'baile'), 'event.sqlite');
if (!existsSync(file)) throw new Error('Primero abre /api/baile/public para inicializar el evento.');
const database = new DatabaseSync(file);
database.exec('PRAGMA busy_timeout=5000; BEGIN IMMEDIATE');
try {
  const state = JSON.parse(database.prepare('SELECT data FROM state WHERE id=1').get().data);
  if (state.users.some(u => u.role === 'admin')) {
    console.log('El administrador ya existe. No se cambió su acceso.');
  } else {
    const email = process.env.BAILE_ADMIN_EMAIL || 'organizacion@ritmocaribe.test';
    let passwordHash = process.env.BAILE_ADMIN_HASH;
    let password;
    if (!passwordHash) {
      password = randomBytes(18).toString('base64url');
      const salt = randomBytes(16).toString('hex');
      passwordHash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
    }
    if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash)) throw new Error('Hash de contraseña inválido.');
    state.users.push({ id: randomUUID(), name: 'Organización', email, passwordHash, role: 'admin', categories: [] });
    database.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(state));
    if (password) console.log(JSON.stringify({ email, password }));
    else console.log('Administrador creado con el acceso configurado.');
  }
  database.exec('COMMIT');
} catch (error) { database.exec('ROLLBACK'); throw error; }
finally { database.close(); }
