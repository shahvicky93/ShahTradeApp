# ShahTradeApp

Agricultural trading, inventory, and ledger management system.

## Tech Stack
- **Backend**: Spring Boot 4 (Java 21), Spring Security, Spring Data JPA
- **Database**: PostgreSQL (Supabase, schema `app`, connection pooling)
- **Frontend**: React 18, Tailwind CSS, Axios, Lucide Icons (embedded in JAR)
- **DevOps**: Docker (multi-stage), Docker Compose

## Deployment Steps

### Local / Single JAR
```bash
cd frontend && npm run build && cd ..
./mvnw clean package -DskipTests
java -jar target/book_keeping-0.0.1-SNAPSHOT.jar
```
App runs at `http://localhost:8080` (Default: `admin` / `admin123`).

### Docker Compose
```bash
docker compose up --build -d
```

## Deploy on Render.com

1. **Push repository** to GitHub or GitLab.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** ➔ **Web Service**.
3. Select your repository and choose **Docker** runtime.
4. Add **Environment Variables**:
   - `SUPABASE_DB_URL`: `jdbc:postgresql://aws-0-eu-west-1.pooler.supabase.com:5432/postgres?currentSchema=app&sslmode=require`
   - `SUPABASE_DB_USER`: `postgres.oglhvyszhokkvjrrcolu`
   - `SUPABASE_DB_PASSWORD`: `<supabase-password>`
   - `PORT`: `8080`
5. Click **Deploy Web Service**. Render automatically builds the multi-stage Dockerfile and deploys the unified app.
