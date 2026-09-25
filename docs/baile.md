# Competencia de baile

El módulo está en `/prueba-baile`, con identidad visual y cuentas propias. Es un evento de ejemplo llamado Ritmo Caribe; las tarifas iniciales son ficticias. No recibe pagos bancarios: registra comprobantes que la organización valida manualmente.

## Accesos

- `/prueba-baile/registro`: registro de participantes.
- `/prueba-baile/acceso`: inicio de sesión y redirección según rol.
- `/prueba-baile/participante`: Full Pass, categorías y pistas.
- `/prueba-baile/admin`: centro de control con módulos de registros, inscripciones, pagos, acreditación, contabilidad, música, programación, categorías, jurados, resultados y ajustes. Cada módulo tiene un enlace directo, por ejemplo `/prueba-baile/admin#registros`.
- `/prueba-baile/jurado`: categorías asignadas y calificaciones propias.

La cuenta inicial de organización se crea desde el servidor, nunca con un formulario público. Tras abrir `/api/baile/public`, ejecutar `node scripts/baile-admin.cjs` en el mismo entorno de datos. El comando genera una contraseña aleatoria una sola vez y no reemplaza cuentas existentes. También admite `BAILE_ADMIN_HASH` (salt hexadecimal de 16 bytes, dos puntos y scrypt de 64 bytes) y `BAILE_ADMIN_EMAIL`.

En administración, **Crear recorrido de ejemplo** crea dos participantes ficticios, tres jurados y comprobantes de ejemplo. Los accesos se muestran una sola vez y se pueden descargar. Los jurados y participantes pueden probarse en ventanas de navegador independientes. Para recuperar un acceso, el administrador puede restablecer la contraseña.

## Operación

1. El participante crea cuenta y recibe un código. Su registro está pendiente hasta aprobar el Full Pass.
2. Envía un comprobante con valor y fecha. La organización aprueba o rechaza con motivo.
3. Full Pass aprobado habilita una inscripción independiente por categoría; parejas y grupos indican nombre e integrantes.
4. Cada categoría tiene pago propio. Su aprobación asigna un número consecutivo, estable dentro de esa categoría.
5. La pista se carga después de aprobar los pagos. Puede reemplazarse hasta el límite configurado en hora de Colombia; se bloquea cuando hay calificaciones o la categoría entra en tarima.
6. Cada jurado recibe solo números, categorías asignadas y notas propias. Sus seis criterios se califican de 1 a 10.
7. Enviar bloquea la calificación. La organización puede reabrirla dejando un motivo en el historial.
8. Se configura promedio de todos los criterios/jurados (1–10) o suma. Criterios con igual peso. Empates comparten posición; filas incompletas no tienen posición. Las posiciones completas siguen siendo provisionales hasta finalizar la categoría desde Minuto a minuto.
9. Listados, registros, inscripciones, pagos, acreditaciones, programación y resultados se exportan como CSV compatible con Excel. Las pistas se reproducen y descargan individualmente o en ZIP por categoría/evento (máximo 100 MB por descarga). Reproducir audio nunca cambia el estado de tarima.

## Módulos de organización

- **Registros:** búsqueda por nombre, documento, código, ciudad o academia, filtros, orden y paginación. Ficha individual con comprobantes, categorías, notas, acreditación, observaciones internas y restablecimiento de acceso. Las observaciones internas nunca se entregan a participantes o jurados.
- **Inscripciones:** vista separada por categoría, equipo y estado de pago. Full Pass y categorías conservan comprobantes independientes.
- **Acreditación:** exige Full Pass aprobado. Un código de manilla identifica a un titular, no se reutiliza y solo puede anularse dejando motivo. No se puede rechazar el Full Pass mientras conserve acreditación activa. Los integrantes de parejas/grupos no se acreditan automáticamente.
- **Contabilidad:** resumen operativo de valores inscritos, comprobantes aprobados y pendientes. No es conciliación bancaria. Un excedente no compensa automáticamente otro concepto. Las tarifas quedan fijadas al crear cada registro/inscripción.
- **Minuto a minuto:** un bloque por categoría, fecha y hora de Colombia, escenario, duración y observación interna. Impide cruces de horario en el mismo escenario. Estados: programado, camerino, tarima, finalizado o cancelado. Para iniciar exige competidores habilitados, pistas y jurados. Para finalizar exige todas las notas bloqueadas.
- **Cierre:** al entrar en tarima quedan fijos horario, escenario, jurados, pagos y pistas. La finalización cierra la categoría y bloquea también las notas y el cambio de fórmula. No hay reapertura de resultados definitivos en esta versión; revisar antes de finalizar.
- **Participante:** ve su manilla activa y la programación de sus categorías, sin observaciones internas.
- **Ajustes:** apertura independiente para registros generales e inscripciones por categoría.

La organización de estos módulos toma como referencia funcional el panel de Sunfest, sin copiar sus datos personales, cuentas, marcas o diseños. El acceso adicional de calificaciones de esa referencia no fue utilizado.

## Almacenamiento

Node >=22.13, SQLite nativo. Estado, sesiones y archivos están en `BAILE_DATA_DIR/event.sqlite` (por defecto `data/baile`). La base usa WAL y transacciones para proteger códigos, estados y notas frente a solicitudes simultáneas. Comprobantes privados PDF/JPG/PNG/WebP hasta 5 MB; audio MP3/WAV/OGG/M4A hasta 20 MB; límite global de archivos 5 GB. Las versiones antiguas se conservan. Se valida firma de archivo y permiso en el servidor.

El despliegue crea el volumen Docker `tornirepuestos_baile_data` y el archivo de composición `baile.override.json`. Conservar este override en despliegues manuales: `docker compose -f <archivo-base> -f baile.override.json up -d --build`. No eliminar el volumen. Los datos no están en Git ni en `public`. Para copias con el sistema en ejecución usar la API de backup SQLite o `VACUUM INTO`, no copiar solo el archivo principal mientras WAL esté activo.

La migración de versión 1 a 2 completa los campos nuevos al leer, conservando cuentas, comprobantes, archivos y calificaciones. Para registros antiguos sin tarifa guardada, se usa la tarifa configurada al migrar: las tarifas históricas previas no pueden reconstruirse. La siguiente transacción persiste la migración.

## Verificación

`npm run build` y `node --test tests/baile.integration.mjs`.

Las pruebas usan una base temporal independiente y un servidor en el puerto 33219; comprueban todo el flujo, archivos privados, independencia de jurados, bloqueos, cálculo, empates, migración, tarifas históricas, cierres independientes, acreditación, notas privadas, ZIP, programación y persistencia tras reinicio.

## Alcance de esta versión

Los ejemplos y tarifas son editables. No incluye cobros automáticos, correo transaccional, recuperación de contraseña por correo, generación de facturas, gastos/devoluciones, bootcamps, tallas, pases por días ni rondas eliminatorias. La programación agrupa categorías, no turnos individuales. Los nombres de integrantes de parejas/grupos los declara el titular de la inscripción; no se cruzan todavía sus Full Pass individuales. La cantidad de criterios y sus pesos están fijados en seis criterios iguales. Para operar un evento real hay que definir las reglas de la organización, datos del evento y medios de pago reales antes de retirar el aviso de demostración.
