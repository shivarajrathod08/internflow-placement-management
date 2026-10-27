# ==========================================
# InternFlow Backend - Multi-stage Production Dockerfile
# ==========================================

# 1. Build Stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build package
COPY src ./src
RUN mvn clean package -DskipTests -B

# 2. Runtime Stage (Lightweight JRE)
FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app

# Create non-root system user for security
RUN groupadd -r internflow && useradd -r -g internflow -u 1001 internflow && \
    mkdir -p /app/storage /app/storage/resume /app/storage/resumes /app/storage/offers && \
    chown -R internflow:internflow /app

# Copy executable jar from build stage
COPY --from=build --chown=internflow:internflow /workspace/target/*.jar app.jar

USER internflow:internflow

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom" \
    PORT=8080

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
