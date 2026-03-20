# Tornirepuestos-web - Estado del Proyecto

## Fecha
- 2026-03-20

## Resumen
Landing de Tornirepuestos enfocada a cotización (estilo moderno B/N). El sitio está pensado para publicarse detrás de Nginx en la ruta:
- `http://187.124.65.93/tornirepuestos/`

En este momento el despliegue está **bloqueado** porque el repo no tiene el scaffolding completo de Next.js (falta `package.json`) y por eso:
- `npm start` / `npm run build` fallan.
- El `Dockerfile` (deploy) falla al hacer `COPY package.json ...`.
- Nginx devuelve **502 Bad Gateway** porque no hay nada escuchando en `127.0.0.1:3020`.

## URLs / Rutas
- URL pública planificada: `http://187.124.65.93/tornirepuestos/` (actualmente 502)
- Upstream esperado (interno): `http://127.0.0.1:3020/`

## Infra / Deploy (VPS)
### Nginx
- Config: `/etc/nginx/sites-enabled/uploader.conf`
- Regla:
  - `location ^~ /tornirepuestos/ { proxy_pass http://127.0.0.1:3020; }`
  - `location = /tornirepuestos { return 302 /tornirepuestos/; }`

### Docker Compose
- Carpeta deploy: `/root/.openclaw/workspace/deployments/tornirepuestos-web`
- `docker-compose.yml` define servicio `tornirepuestos_web`:
  - Build context: `../../Tornirepuestos-web`
  - Dockerfile: `../deployments/tornirepuestos-web/Dockerfile`
  - Ports: `127.0.0.1:3020:3000`

### Errores actuales (reproducibles)
- `npm ERR! enoent Could not read package.json` (no existe `package.json` en el repo)
- Docker build:
  - `COPY package.json package-lock.json ./`
  - `"/package.json": not found`
- Nginx:
  - `502 Bad Gateway` por `connect() failed (111) while connecting to upstream`

## Repo
- Repo remoto: `https://github.com/julianchocmanrique/Tornirepuestos-web`
- Ruta local: `/root/.openclaw/workspace/Tornirepuestos-web`

## Qué está hecho en UI
- Página base creada en:
  - `src/app/page.tsx`
  - `src/app/globals.css`

## Pendiente (prioridad)
1. Convertir el repo a un **Next.js real** (scaffolding completo):
   - Crear `package.json`
   - Añadir `next`, `react`, `react-dom` + scripts (`dev`, `build`, `start`, `lint`)
   - Crear `src/app/layout.tsx`
   - Añadir `next.config.(js|ts)` con `basePath: "/tornirepuestos"` **si se mantiene como subpath**.
2. Ajustar deploy para subpath (revisar assets/routing) **o** cambiar a subdominio/puerto dedicado.
3. Levantar servicio y validar:
   - `curl http://127.0.0.1:3020/`
   - `curl http://187.124.65.93/tornirepuestos/`

## Comandos útiles
(Una vez exista `package.json`)
```bash
npm install
npm run dev
npm run build
npm start
```

## Notas
- Se probó ejecutar `npx next start -p 3021`, pero falla en producción si no existe `.next/` (requiere `npm run build`).
