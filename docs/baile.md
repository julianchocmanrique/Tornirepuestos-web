# Competencia de baile

El módulo está en `/prueba-baile`, con identidad visual y cuentas propias. Conserva la competencia original Ritmo Caribe y permite competencias independientes desde el catálogo de eventos; las tarifas iniciales son ficticias. No recibe pagos bancarios: registra comprobantes que la organización valida manualmente.

## Accesos

- `/prueba-baile/registro`: registro de participantes.
- `/prueba-baile/acceso`: inicio de sesión y redirección según rol.
- `/prueba-baile/participante`: Full Pass, categorías y pistas.
- `/prueba-baile/admin`: centro de control con módulos de registros, inscripciones, acreditación, contabilidad, música, programación, categorías, jurados, resultados y ajustes. Cada módulo tiene un enlace directo, por ejemplo `/prueba-baile/admin#registros`.
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

Desde **Registros > Nuevo participante**, la organización puede crear una cuenta con los mismos datos y validaciones del registro público. Debe confirmar que cuenta con autorización de la persona e indicar una contraseña inicial para entregársela por un canal privado. El alta queda auditada a nombre del administrador y abre la ficha sin reemplazar su sesión. No aprueba pagos ni inscribe categorías automáticamente. Esta alta manual está disponible incluso con el registro público cerrado; no envía correos automáticos.

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

Node >=22.13, SQLite nativo. Estado, sesiones y archivos están en `BAILE_DATA_DIR/event.sqlite` (por defecto `data/baile`). La base usa WAL y transacciones para proteger códigos, estados y notas frente a solicitudes simultáneas. Comprobantes privados PDF/JPG/PNG/WebP hasta 5 MB; audio MP3/WAV/OGG/M4A hasta 20 MB; límite de archivos de 5 GB por evento. Las versiones antiguas se conservan. Se valida firma de archivo y permiso en el servidor.

El despliegue crea el volumen Docker `tornirepuestos_baile_data` y el archivo de composición `baile.override.json`. Conservar este override en despliegues manuales: `docker compose -f <archivo-base> -f baile.override.json up -d --build`. No eliminar el volumen. Los datos no están en Git ni en `public`. Para copias con el sistema en ejecución usar la API de backup SQLite o `VACUUM INTO`, no copiar solo el archivo principal mientras WAL esté activo.

La migración de versión 1 a 2 completa los campos nuevos al leer, conservando cuentas, comprobantes, archivos y calificaciones. Para registros antiguos sin tarifa guardada, se usa la tarifa configurada al migrar: las tarifas históricas previas no pueden reconstruirse. La siguiente transacción persiste la migración.

## Verificación

### Perfiles y acceso público

- `superadmin`: control completo del evento actual: configuración, categorías, registros, pagos, jurados, programación y resultados. Las cuentas antiguas con rol `admin` migran a `superadmin` conservando IDs y claves.
- `contractor`: consulta participantes e inscripciones por categoría y revisa comprobantes (aprobar/rechazar). Puede descargar recibos y reproducir/descargar las pistas actualmente asociadas a una inscripción. No puede modificar configuración, accesos, categorías, notas, acreditaciones ni calificaciones, ni exportar el ZIP de música o acceder a pistas antiguas sin inscripción.

La tabla de Inscripciones no muestra importes y su exportación tampoco los incluye. La acción Ver abre una ficha completa en /prueba-baile/inscripciones/[id], con datos del titular, categoría, integrantes declarados, música, comprobante y observaciones. Superadministración puede editar datos, cambiar categoría y reemplazar archivos mientras no haya calificaciones ni competencia iniciada. El contratista consulta y valida pagos; no edita los datos. Cambiar categoría conserva la pista y exige la misma tarifa si existe un pago. Reemplazar un comprobante conserva importe y fecha, pero vuelve el pago a En revisión. Las notas internas no se muestran a participantes ni jurados. La referencia del pago es un ID interno, no una referencia bancaria. Los integrantes se muestran tal como fueron registrados; no se infiere una cantidad a partir de texto libre.
- `participant`: conserva registro, inscripciones, comprobantes y pistas propios, con los requisitos de pago y plazos existentes.
- `judge`: conserva categorías asignadas y calificaciones propias.
- Visitantes: información general y `/prueba-baile/resultados`, sin sesión. La API `/api/baile/results` solo proyecta nombre de participante/equipo, número, posición y puntuación de categorías finalizadas con todas las notas. No publica documentos, contactos, pagos, recibos ni notas internas.

El ingreso acepta usuario o correo. `scripts/baile-test-profiles.cjs` configura únicamente los alias `superadmin`, `admin` (contratista) y `participante1`, mediante hashes scrypt recibidos en `BAILE_TEST_PROFILE_HASHES`; no contiene claves predeterminadas. Requiere modo de ejemplo, crea un backup SQLite consistente y no reemplaza cuentas ajenas. Sus cuentas `demoOnly` quedan bloqueadas, incluidas sus sesiones, al desactivar `settings.demo`. El workflow permite aplicar estos hashes de manera explícita; los despliegues normales no cambian claves. Este script configura la competencia original; no propaga sus participantes ni contratistas a los eventos independientes.

Durante el modo de ejemplo, el botón del encabezado **Cambiar usuario** abre un selector visual de perfiles activos. Solo usuarios con sesión pueden consultar nombres y roles; no se listan correos, documentos ni claves. Elegir una tarjeta entra directamente sin clave y revoca la sesión anterior. El servidor exige sesión previa, origen válido, perfil activo y modo de prueba; aplica límites de cambios y registra la acción en auditoría. Un perfil desactivado o inválido conserva la sesión actual. El panel también permite cerrar sesión por completo; después se usa el acceso normal por usuario o correo y contraseña. Al desactivar `settings.demo`, tanto el selector como su API quedan bloqueados. Este acceso rápido permite cambiar de rol (incluso a superadministración): utilizarlo solamente en pruebas con personas de confianza, nunca con participantes reales.

`npm run build` y `node --test tests/baile.integration.mjs`.

Las pruebas usan una base temporal independiente y un servidor en el puerto 33219; comprueban todo el flujo, archivos privados, independencia de jurados, bloqueos, cálculo, empates, migración, tarifas históricas, cierres independientes, acreditación, notas privadas, ZIP, programación y persistencia tras reinicio.

## Alcance de esta versión

Los ejemplos y tarifas son editables. No incluye cobros automáticos, correo transaccional, recuperación de contraseña por correo, generación de facturas, gastos/devoluciones, bootcamps, tallas, pases por días ni rondas eliminatorias. La programación agrupa categorías, no turnos individuales. Los nombres de integrantes de parejas/grupos los declara el titular de la inscripción; no se cruzan todavía sus Full Pass individuales. La cantidad de criterios y sus pesos están fijados en seis criterios iguales. Para operar un evento real hay que definir las reglas de la organización, datos del evento y medios de pago reales antes de retirar el aviso de demostración.

## Portada editorial de eventos

El inicio incorpora `EventHome`: carrusel de tarjetas con perspectiva de los cinco eventos publicados más recientemente y agenda de todos los próximos eventos, agrupados por mes y ordenados por fecha ascendente. El día se calcula en America/Bogota; un evento se mantiene durante toda su fecha y desaparece de la agenda al día siguiente. Incluye filtros por categoría general (Danza, Belleza, Música, Teatro y Otros), páginas propias de evento, flechas, indicadores, gesto táctil, pausa y respeto a movimiento reducido. Las diapositivas inactivas no reciben foco.

El catálogo se configura en `src/lib/baile/event-catalog.ts`. Los tres ejemplos iniciales, sus fechas, ciudades y fotografías generadas son ilustrativos y están rotulados; se ocultan cuando se desactiva el modo demo. Las fotos WebP son locales, sin proveedores externos en tiempo de ejecución. Antes de anunciar eventos reales, reemplazar esta información con nombres, fotos autorizadas y fechas confirmadas. Cada entrada del catálogo tiene su propia competencia, con base de datos, categorías, registros, pagos, pistas, jurados y resultados independientes. La competencia original mantiene sus rutas y datos sin migraciones destructivas. Pruebas: `node --test tests/baile-events.test.mjs`.

## Eventos independientes

- Página pública: `/prueba-baile/eventos/<id>`, resumen, fecha, ciudad, categorías y botón Registrarse.
- Registro y paneles: `/prueba-baile/eventos/<id>/registro`, `acceso`, `participante`, `admin`, `contratista`, `jurado`, `resultados`. La ficha usa `inscripciones/<inscripción>`.
- API: `/api/baile/eventos/<id>/<acción>`. Solo se permiten identificadores existentes en `event-catalog.ts`; los ejemplos se ocultan si se desactiva la demostración global.
- Persistencia: `BAILE_DATA_DIR/events/<id>/event.sqlite`. El volumen existente conserva toda la carpeta, incluidos los archivos almacenados en SQLite. Respaldar cada base con SQLite backup/VACUUM INTO, o detener escrituras y copiar la carpeta completa; no copiar solo el archivo principal durante escrituras WAL.
- La base original sigue en `BAILE_DATA_DIR/event.sqlite`; no se copian participantes, recibos, cuentas, calificaciones ni categorías entre eventos.
- La sesión usa una cookie diferente por evento. Un token de otro evento, incluso renombrando la cookie, no es válido. El contexto de base de datos se conserva por solicitud con AsyncLocalStorage, incluidas operaciones asíncronas.
- Los superadministradores originales pueden iniciar sesión en cada evento con su acceso existente. No se duplican sus claves: la sesión referencia la cuenta original y se invalida si cambia su contraseña, se elimina o pierde el rol. Participantes, contratistas y jurados son cuentas locales del evento.
- Superadministración > Ajustes permite crear o actualizar el acceso del contratista por correo. Actualizar su contraseña cierra sus sesiones de ese evento. No permite convertir participantes en contratistas ni modificar el acceso global. Jurados se gestionan desde su módulo habitual.
- El mismo correo y documento pueden registrarse en distintos eventos. Cada registro requiere su propio Full Pass y cada categoría su propio comprobante. Los precios fijados al registrar/inscribir no cambian con posteriores ajustes de tarifa.
- Los pagos siguen siendo carga de comprobante y validación manual, no cobros con tarjeta ni una pasarela bancaria. Nombres, fechas, fotografías y precios del catálogo inicial siguen siendo ejemplos hasta que la organización confirme información real.

Verificación: `npm run build`, `npm run test:baile`, `node --test tests/baile-multievent.integration.mjs tests/baile-events.test.mjs`. Prueba visual local: `tests/baile-events.browser.cjs` (Playwright y Chrome indicados mediante PLAYWRIGHT_MODULE/CHROME_PATH). Usar BAILE_DATA_DIR temporal; no crear datos de prueba en producción.

## Registro público en cinco pasos

La ruta `/prueba-baile/registro` tiene una línea de progreso: Datos, Nivel,
ID, Exoneración y Documentos. Conserva los campos y archivos al retroceder;
no guarda contraseñas ni documentos en localStorage. Recargar pierde el borrador.

El envío crea en una sola transacción el participante, su cuenta, foto privada,
carta aceptada (texto exacto, versión, trazos de firma y hora del servidor) y
comprobante del Full Pass pendiente de validación. No aprueba pagos. Las
categorías siguen siendo independientes. El acceso admite documento o correo;
la contraseña se guarda con scrypt y no se envía por correo. El servidor valida
confirmaciones, niveles, consentimiento, firma, archivos y tarifa. La carta se
compara normalizando saltos de línea CRLF/LF para funcionar en Windows.

En Ajustes se pueden completar fecha inicial, fecha final y ciudad/sede. La carta
usa esos datos y el nombre del evento; nunca los datos del sitio de referencia.
En modo de ejemplo, los datos no definidos se indican como pendientes de publicar.
Fuera de modo de ejemplo deben estar definidos antes de aceptar registros.
El texto proporcionado por el organizador necesita revisión jurídica antes de su
uso real. La captura de una firma no equivale a certificar su validez jurídica.
Para menores se solicitan identificación, autorización y firma del representante;
la organización debe revisar sus requisitos específicos.

La ficha (Registro > Ver ficha) y el panel del participante permiten consultar
los nuevos datos, la foto y la carta guardada. Los registros anteriores y las
altas manuales del administrador se conservan sin inventar firmas ni documentos:
se muestran como registros sin documentación del nuevo flujo. El alta manual no
puede hacer constar la aceptación de esta carta en nombre del participante.
No se implementan códigos de descuento: no hay todavía reglas de descuentos
configuradas, por lo que no se ofrece un control que prometa una rebaja inexistente.

Pruebas: `npm run build`, `npm run test:baile` y
`node --test tests/baile-wizard.test.mjs`. Las pruebas usan una base SQLite temporal,
identidades ficticias y trazos sintéticos; no crean participantes en producción.

## Pases y tarifas por evento

The Sun Fest tiene su propio ejemplo en `/prueba-baile/eventos/thesunfest`:
competidor $70.000, congreso $95.000 y acompañante $20.000 COP por persona.
Categorías de ejemplo: solista $80.000, pareja/dúo $105.000 y grupo $250.000
por inscripción. La ciudad, los ritmos y divisiones deben definirse antes de
usar el evento con público real. Las fechas de agosto y las tarifas con corte
del 31 de julio de 2026 son referencias de prueba, no una oferta vigente.

En Ajustes > Pases y beneficios, superadministración puede crear o editar
precios, beneficios, vigencia, disponibilidad y derecho a competir para cada
evento. Los valores por categoría se editan en Categorías. Contratistas y
participantes no pueden modificar planes. Los registros existentes conservan
su precio y su pase; modificar un plan solo afecta nuevos registros.

El acompañante puede registrarse y cargar su comprobante, pero no competir.
Esta restricción se valida en el servidor. Su declaración de registro no lo
identifica como competidor. Cambiar el pase invalida la firma y aceptación
previas. Fuera del modo de prueba se rechazan tarifas vencidas. Los eventos
anteriores conservan su Full Pass y su información sin reinicializar datos.

Pruebas específicas: `tests/baile-multievent.integration.mjs` y
`tests/baile-pricing.browser.cjs`; usar almacenamiento temporal y comprobantes
ficticios, nunca crear registros de prueba en producción para verificar cambios.

## Publicación

Por indicación del responsable, los cambios de este proyecto se publican en la página oficial (`https://tornirepuestos.com/prueba-baile`) después de integrar y verificar la versión completa. No dar por entregado un cambio solamente por estar guardado localmente. Conservar el volumen de datos, no reinicializar cuentas y comprobar el despliegue y los registros existentes antes de confirmar la publicación.

### Perfil de jurado de prueba e inventario de cuentas

`baile-test-profiles.cjs` acepta los hashes de uno o varios perfiles conocidos.
Solo crea/actualiza los perfiles indicados, conserva las categorías ya asignadas
y no restablece las claves ni las sesiones de otras cuentas. El perfil opcional
`jurado1` se crea como jurado, sin categorías asignadas y con `demoOnly: true`.
No puede ingresar al desactivar el modo de pruebas. No se reduce la longitud
mínima de las contraseñas del registro normal ni se guardan claves en texto plano.

`GET /api/baile/users` lista identificador, nombre, usuario, correo, rol y condición
de prueba, exclusivamente para superadministradores. Nunca devuelve hashes.
Las rutas de eventos mantienen su propio inventario y sus controles de acceso.
