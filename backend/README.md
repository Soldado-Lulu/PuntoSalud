# Medicamentos offline-first — Backend MVP

API con **Node.js 22, Express, PostgreSQL, Sequelize y Docker**. La nube mantiene el catálogo maestro; el frontend (siguiente etapa) descargará una copia de lectura en IndexedDB y la mostrará incluso sin conexión.

> **Límite sanitario:** los registros son demostrativos y **no verificados**. Este proyecto no diagnostica ni indica qué medicamento tomar. No publicar recomendaciones clínicas automáticas sin fuentes regulatorias y revisión profesional. `Typirect` no se siembra porque aún no se verificó su composición.

## Primer inicio con Docker

1. Copia `.env.example` a `.env` y cambia los secretos. En Docker Compose usa además `POSTGRES_PASSWORD`:

```env
POSTGRES_USER=meduser
POSTGRES_PASSWORD=pon_aqui_una_clave_segura
POSTGRES_DB=medicamentos
ADMIN_API_KEY=pon_aqui_un_secreto_de_32_caracteres_o_mas
CORS_ORIGINS=http://localhost:5173
```

2. En `.env`, la `DATABASE_URL` de ejemplo sirve para ejecutar Node **fuera** del contenedor; Docker Compose construye automáticamente su propia `DATABASE_URL` apuntando a `db`.
3. Ejecuta `docker compose up --build -d`.
4. Prueba `http://localhost:3000/api/v1/health` y `http://localhost:3000/api/v1/sync/catalog`.

Al arrancar, el contenedor ejecuta migraciones y un seed idempotente. **No usamos `sequelize.sync({ alter: true })` en producción.**

## Endpoints

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/v1/health` | Salud del proceso |
| GET | `/api/v1/medications` | Medicamentos y productos |
| GET | `/api/v1/symptoms` | Síntomas de catálogo |
| GET | `/api/v1/sync/catalog` | Snapshot completo versionado para offline |
| POST | `/api/v1/admin/medications` | Crear principio activo |
| PATCH | `/api/v1/admin/medications/:id` | Modificar principio activo |
| POST | `/api/v1/admin/products` | Crear presentación comercial |
| POST | `/api/v1/admin/symptoms` | Crear síntoma |
| POST | `/api/v1/admin/medication-symptoms` | Vincular síntoma y medicamento; **no equivale a prescripción** |

Las rutas `/admin/` requieren cabecera `Authorization: Bearer <ADMIN_API_KEY>`. Nunca colocar esa clave en el navegador, ni guardar en el frontend: en una fase posterior conviene login de administradores con permisos y auditoría.

Ejemplo de crear medicamento (en terminal, reemplazar `TOKEN`):

```bash
curl -X POST http://localhost:3000/api/v1/admin/medications \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"genericName":"Paracetamol","description":"Analgésico y antipirético","verified":false}'
```

## Sincronización offline prevista

1. Con internet, frontend solicita `GET /api/v1/sync/catalog`.
2. Respuesta incluye `revision`, `updatedAt`, `medications` (con `products` y `symptoms`) y `symptoms`.
3. Guardar **toda la respuesta** de forma atómica en IndexedDB; solo entonces marcar la revisión local como aplicada.
4. En siguientes conexiones, mandar la cabecera `If-None-Match: "catalog-2"` (con revisión anterior). Si no hubo cambios, API responde `304`. Si cambió, entrega el catálogo completo, reemplazando la copia local (incluidas eliminaciones si se implementan posteriormente).
5. Un service worker cacheará HTML, JS y CSS para abrir la PWA sin red. **El service worker y IndexedDB se harán en el frontend**, no en el backend.

**Limitación del MVP:** sincronización de lectura de catálogo completo, adecuada para catálogos pequeños. La edición sin internet, sincronización de formularios, resolución de conflictos, escalado con deltas, autenticación real, auditoría clínica, validación de fuentes regulatorias y HTTPS requieren etapas posteriores. Si hay múltiples instancias de API, el número de revisión de la DB sigue siendo compartido.

## Tablas iniciales

- `medications`: principio activo, descripción, función, precauciones, contraindicaciones, efectos adversos y fuente.
- `products`: nombres comerciales, composición, concentración, forma y fabricante, FK a `medications`.
- `symptoms`: vocabulario de síntomas.
- `medication_symptoms`: relación N:M informativa, no regla de prescripción.
- `catalog_versions`: versión global para sincronización.

## Seguridad y despliegue

- Usar HTTPS y secretos fuertes, limitar CORS a dominios propios, proteger la API y la BD, hacer backups y añadir autenticación/admin real antes de producción.
- La BD de Docker se persiste en volumen `pgdata`.
- Para desplegar públicamente, no exponer PostgreSQL, configurar proxy HTTPS (por ejemplo Nginx), control de acceso administrativo, copias de seguridad y monitoreo.
- El `verified: false` significa que el registro de ejemplo **no** se debe mostrar como ficha validada para pacientes.
