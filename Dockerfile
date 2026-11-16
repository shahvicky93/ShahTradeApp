# ==============================================================================
# Multi-stage Dockerfile for Agricultural Trading System
# Stage 1: Build React SPA Frontend
# Stage 2: Build Spring Boot Executable JAR (Embeds Frontend)
# Stage 3: Minimal, Secure JRE 21 Runtime Container
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Frontend Build
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Backend Build
# ------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app

# Cache Maven POM & dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B || true

# Copy backend source
COPY src ./src

# Copy built frontend assets into frontend/dist and static resources directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

# Package application into a single executable JAR
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------
# Stage 3: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy single fat JAR from build stage
COPY --from=backend-builder /app/target/*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
