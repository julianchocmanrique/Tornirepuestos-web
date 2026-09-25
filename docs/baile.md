# Competencia de baile

El módulo está en `/prueba-baile`, con identidad visual y cuentas propias. Es un evento de ejemplo llamado Ritmo Caribe; las tarifas iniciales son ficticias. No recibe pagos bancarios: registra comprobantes que la organización valida manualmente.

## Accesos

- `/prueba-baile/registro`: registro de participantes.
- `/prueba-baile/acceso`: inicio de sesión y redirección según rol.
- `/prueba-baile/participante`: Full Pass, categorías y pistas.
- `/prueba-baile/admin`: participantes, comprobantes, categorías, jurados, resultados y ajustes.
- `/prueba-baile/jurado`: categorías asignadas y calificaciones propias.

La cuenta inicial de organización se crea desde el servidor, nunca con un formulario público. Tras abrir `/api/baile/public`, ejecutar `node scripts/baile-admin.cjs` en el mismo entorno de datos. El comando genera una contraseña aleatoria una sola vez y no reemplaza cuentas existentes. También admite `BAILE_ADMIN_HASH` (salt hexadecimal de 16 bytes, dos puntos y scrypt de 64 bytes) y `BAILE_ADMIN_EMAIL`.

En administración, **Crear recorrido de ejemplo** crea dos participantes ficticios, tres jurados y comprobantes de ejemplo. Los accesos se muestran una sola vez y se pueden descargar. Los jurados y participantes pueden probarse en ventanas de navegador independientes. Para recuperar un acceso, el administrador puede restablecer la contraseña.

## Operación

1. El participante crea cuenta y recibe un código. Su registro está pendiente hasta aprobar el Full Pass.
2. Envía un comprobante con valor y fecha. La organización aprueba o rechaza con motivo.
3. Full Pass aprobado habilita una inscripción independiente por categoría; parejas y grupos indican nombre e integrantes.
4. Cada categoría tiene pago propio. Su aprobación asigna un número consecutivo, estable dentro de esa categoría.
5. La pista se carga después de aprobar los pagos. Puede reemplazarse hasta el límite configurado en hora de Colombia; se bloquea cuando hay calificaciones.
6. Cada jurado recibe solo números, categorías asignadas y notas propias. Sus seis criterios se califican de 1 a 10.
7. Enviar bloquea la calificación. La organización puede reabrirla dejando un motivo en el historial.
8. Los resultados requieren todas las notas bloqueadas. Se configura promedio de todos los criterios/jurados (1–10) o suma. Criterios con igual peso. Empates comparten posición; filas incompletas son provisionales y no tienen posición.
9. Listados y resultados se exportan como CSV compatible con Excel. Las pistas se reproducen y descargan desde administración.

## Almacenamiento

Node >=22.13, SQLite nativo. Estado, sesiones y archivos están en `BAILE_DATA_DIR/event.sqlite` (por defecto `data/baile`). La base usa WAL y transacciones para proteger códigos, estados y notas frente a solicitudes simultáneas. Comprobantes privados PDF/JPG/PNG/WebP hasta 5 MB; audio MP3/WAV/OGG/M4A hasta 20 MB; límite global de archivos 5 GB. Las versiones antiguas se conservan. Se valida firma de archivo y permiso en el servidor.

El despliegue crea el volumen Docker `tornirepuestos_baile_data` y el archivo de composición `baile.override.json`. Conservar este override en despliegues manuales: `docker compose -f <archivo-base> -f baile.override.json up -d --build`. No eliminar el volumen. Los datos no están en Git ni en `public`. Para copias con el sistema en ejecución usar la API de backup SQLite o `VACUUM INTO`, no copiar solo el archivo principal mientras WAL esté activo.

## Verificación

`npm run build` y `node --test tests/baile.integration.mjs`.

Las pruebas usan una base temporal independiente y un servidor en el puerto 33219; comprueban todo el flujo, archivos privados, independencia de jurados, bloqueos, cálculo, empates y persistencia tras reinicio.

## Alcance de esta versión

Los ejemplos y tarifas son editables. No incluye cobros automáticos, correo transaccional, recuperación de contraseña por correo ni generación de facturas. Los nombres de integrantes de parejas/grupos los declara el titular de la inscripción; no se cruzan todavía sus Full Pass individuales. La cantidad de criterios y sus pesos están fijados en seis criterios iguales. Para operar un evento real hay que definir las reglas de la organización, datos del evento y medios de pago reales antes de retirar el aviso de demostración.
