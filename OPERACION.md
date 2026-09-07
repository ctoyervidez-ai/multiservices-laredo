# Multiservices Laredo: operación y puesta en marcha

## Sitio y contacto

- Se conserva `https://www.ethrovsdraft.com`; el dominio raíz debe continuar redirigiendo al dominio publicado.
- Correo actual: `vacantes@multiservicesldo.com`. Puede modificarse en Contenido y fotos.
- Las solicitudes de candidatos y empresas se guardan antes de intentar avisos por correo.
- El portal mantiene la autenticación existente. No cambies los secretos de autenticación de producción al publicar esta versión.

## Trabajo diario

1. **Vacantes:** crear borradores, revisar descripción y condiciones, publicar o cerrar.
2. **Candidatos:** consultar solicitudes, descargar CV y actualizar seguimiento. Archivar no elimina los datos.
3. **Empresas y resultados:** sección exclusiva del administrador con los 200 prospectos más recientes; filtrar por empresa, contacto, folio o estado. Estados: nuevo, contactado, propuesta, cliente, no continúa y archivado.
4. **Resultados:** conteos de los últimos 30 días en UTC. Vistas no son visitantes únicos; clics no son conversaciones. Las solicitudes provienen de registros guardados. No hay seguimiento entre dispositivos ni atribución de campañas.
5. **Avisos:** revisar pendientes, aceptados por el proveedor y envíos que requieren revisión. Cada nueva solicitud intenta enviar el aviso interno y su confirmación. Los fallos no descartan solicitudes. No existe un programador de reintentos: el administrador procesa hasta cuatro pendientes por acción. Los envíos inciertos mayores de 23 horas requieren revisión antes de cualquier reenvío.

## Activar correo y recuperación de acceso

La integración está preparada para Resend, pero **no hay servicio ni credenciales configurados**. No se envían correos reales hasta completar estos pasos:

1. Crear una cuenta en Resend y verificar un dominio remitente que controles mediante sus registros DNS.
2. Crear una clave con permiso de envío y configurar `RESEND_API_KEY` como secreto del sitio en Sites.
3. Configurar `EMAIL_FROM` con un remitente del dominio verificado. No basta con usar el correo de recepción como remitente si su dominio no está verificado.
4. Con el servicio conectado, revisar los pendientes acumulados y procesarlos desde Empresas y resultados. Comprobar aceptación y entrega real en Resend.
5. Solicitar recuperación desde `/portal/recuperar`, comprobar que el correo llega al administrador y completar el cambio. El enlace vence en 30 minutos y funciona una sola vez. Al cambiar la contraseña, las sesiones anteriores dejan de ser válidas. Si el correo no llega, se conserva la vía de asistencia con Ethrov.

El aviso interno incluye folio y enlace al portal, sin adjuntar CV. La confirmación incluye el folio. “Aceptado por el proveedor” no significa entregado: no se implementaron webhooks de rebotes/entrega. Los cuerpos de mensajes aceptados se vacían en la cola.

Referencias de implementación: [API de envío de Resend](https://resend.com/docs/api-reference/emails/send-email), [claves de idempotencia](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Privacidad

`/privacidad` explica en español e inglés los formularios, acceso al CV, correo, enlaces externos, medición y contacto para solicitudes sobre datos. Describe el funcionamiento del sitio; no afirma que exista un borrado automático. La política de conservación del negocio y su proceso para atender solicitudes de eliminación deben ser definidos por su responsable. La medición respeta Do Not Track y Global Privacy Control, no guarda consultas URL ni contenido de formularios y usa conteos agregados sin cookies de analítica. Las defensas contra abuso conservan temporalmente hashes derivados de direcciones IP.

Se siguió el criterio de describir prácticas reales, sin prometer procesos no implementados: [guía de privacidad de la FTC](https://www.ftc.gov/business-guidance/privacy-security).

## Publicación

Aplicar la nueva migración `0003_outstanding_white_tiger.sql` mediante Sites antes de servir el código. No editar las migraciones anteriores. Añade tablas de prospectos, avisos, métricas y recuperación; no borra registros existentes. La integración de correo es opcional para publicar: sin configuración, las solicitudes funcionan y los avisos quedan pendientes. El sitio público y su acceso actual no se modifican hasta aprobar la publicación.

## Validación y desarrollo

- `pnpm install --frozen-lockfile`
- `pnpm test`: migraciones SQLite, aislamiento entre empresas, permisos, correo, recuperación y enlaces nativos.
- `pnpm check:types`, `pnpm lint`, `pnpm build`.
- `pnpm test:site`: requiere servidor local en 3001, o `TEST_SITE_URL` para comprobar enlaces de otro sitio (solo lectura).
- `RUN_LOCAL_WORKFLOWS=1 pnpm test:workflows`: solo acepta localhost/127.0.0.1; crea datos sintéticos. En PowerShell usar `$env:RUN_LOCAL_WORKFLOWS = '1'` antes del comando.

Para pruebas integrales locales, configurar una base de datos D1 local con todas las migraciones, almacenamiento R2 local y secretos de autenticación **exclusivos de prueba**. El flujo de prueba espera el código `Local-test-activation-2026-only`, una fecha futura de expiración y correo deshabilitado. Nunca reutilizar estos valores en producción. El arranque local original crea tablas históricas; las nuevas tablas se crean con las migraciones, no al atender solicitudes.

Se probaron localmente: crear/publicar/cerrar vacante, solicitud con CV, descarga autenticada y bloqueo anónimo, cambio de estado, folio de empresa, reenvío sin duplicar, consulta de resultados, cierre de sesión y comportamiento sin correo. Los tests de correo simulan el proveedor; no certifican entrega real a una bandeja de entrada.
