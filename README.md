# 🔥 Servidor de Aplicaciones Bajo Estrés

**Universidad del Valle — Sede Tuluá**  
Ingeniería de Sistemas | Sistemas Operativos 2026-1  
Profesor: Julian Enrique Castro Segura

---

## 📋 Descripción

Aplicación web de generación de carga controlada sobre un servidor multicapa dockerizado. Permite saturar simultáneamente el servidor web (Next.js) y la base de datos (PostgreSQL) mediante cuatro mecanismos de estrés independientes y configurables, con un dashboard de monitoreo en tiempo real.

La aplicación replica escenarios reales de producción donde múltiples servicios compiten por CPU, memoria RAM y acceso a disco.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  Ubuntu WSL2 (Host)                  │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │   node-api   │  │ postgres-db  │                 │
│  │  Next.js 14  │──│ PostgreSQL16 │                 │
│  │  puerto 3000 │  │  puerto 5432 │                 │
│  └──────────────┘  └──────────────┘                 │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │  pgadmin4    │  │ jupyter-lab  │                 │
│  │  puerto 5050 │  │  puerto 8888 │                 │
│  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Requisitos

- Windows con WSL2 (Ubuntu 22.04+)
- Docker Desktop 24+
- 8 GB RAM mínimo disponible
- 20 GB de espacio en disco

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/adriana5929/MiniproyectoSO.git
cd MiniproyectoSO
```

### 2. Crear el archivo de variables de entorno

Crear un archivo `.env` en la raíz con el siguiente contenido:

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=appdb
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin123
JUPYTER_TOKEN=123456
DATABASE_URL=postgresql://admin:admin123@postgres:5432/appdb
```

### 3. Crear el docker-compose.yml

Crear `docker-compose.yml` en la raíz:

```yaml
services:
  node-app:
    build: ./node-app
    container_name: node-api
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres
    networks:
      - dockerlab
    restart: unless-stopped

  postgres:
    image: postgres:16
    container_name: postgres-db
    restart: always
    env_file:
      - .env
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - dockerlab

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin4
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - dockerlab

  jupyter:
    image: quay.io/jupyter/base-notebook
    container_name: jupyter-lab
    environment:
      JUPYTER_TOKEN: ${JUPYTER_TOKEN}
    ports:
      - "8888:8888"
    volumes:
      - ./jupyter:/home/jovyan/work
    networks:
      - dockerlab

networks:
  dockerlab:

volumes:
  postgres_data:
```

### 4. Ejecutar las migraciones de base de datos

```bash
cd node-app
DATABASE_URL=postgresql://admin:admin123@localhost:5432/appdb npx prisma migrate dev --name init_stress_tables
cd ..
```

### 5. Levantar todos los servicios

```bash
docker compose up --build -d
```

### 6. Verificar que todos los contenedores estén corriendo

```bash
docker compose ps
```

### 7. Acceder a los servicios

| Servicio | URL | Credenciales |
|---|---|---|
| Dashboard de estrés | http://localhost:3000 | — |
| PgAdmin | http://localhost:5050 | admin@admin.com / admin123 |
| JupyterLab | http://localhost:8888 | Token: 123456 |

---

## 🎮 Mecanismos de Estrés

### 1. 🌊 HTTP Flood
Dispara peticiones HTTP concurrentes al servidor Next.js saturando el event loop de Node.js.
- **Parámetro:** Número de conexiones concurrentes (default: 50)
- **Métrica observable:** CPU% del proceso node en htop

### 2. 🗄️ Query Flood
Ejecuta consultas SELECT con JOINs y agregaciones pesadas sobre PostgreSQL de forma concurrente.
- **Parámetro:** Workers concurrentes (default: 20)
- **Métrica observable:** CPU% de postgres, conexiones activas en pg_stat_activity

### 3. 💾 Insert Flood
Realiza inserciones masivas en lotes (batch INSERT) estresando el WAL de PostgreSQL y el I/O de disco.
- **Parámetro:** Tamaño del lote en filas (default: 500)
- **Métrica observable:** wkB/s en iostat, BLOCK I/O en docker stats

### 4. 🔒 Lock Contention
Genera transacciones concurrentes con SELECT FOR UPDATE sobre las mismas filas, produciendo bloqueos entre procesos.
- **Parámetro:** Transacciones concurrentes (default: 30)
- **Métrica observable:** wait_event_type=Lock en pg_stat_activity, Lock waits PG en dashboard

---

## 📊 Monitoreo

### Herramientas del SO utilizadas

```bash
# Monitor interactivo de procesos
htop

# Estadísticas de memoria virtual
vmstat 2 60 > vmstat_estres.txt

# I/O de dispositivos de almacenamiento
iostat -xz 2 10

# Métricas por contenedor
docker stats

# Estado de conexiones PostgreSQL
docker exec postgres-db psql -U admin -d appdb -c \
  "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"

# Bloqueos activos
docker exec postgres-db psql -U admin -d appdb -c \
  "SELECT pid, wait_event_type, wait_event FROM pg_stat_activity WHERE wait_event_type = 'Lock';"
```

---

## 🛠️ Stack Tecnológico

- **Frontend/Backend:** Next.js 16 con App Router y TypeScript
- **Base de datos:** PostgreSQL 16
- **ORM:** Prisma 7 con adapter pg
- **Contenedores:** Docker + Docker Compose
- **Análisis de datos:** JupyterLab con PyTorch
- **Monitoreo:** htop, vmstat, iostat, docker stats, pg_stat_activity

---

## 👩‍💻 Autores

Adriana Noscue — Ingeniería de Sistemas, Universidad del Valle Sede Tuluá
