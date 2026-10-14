# Build Stage
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source and build jar
COPY src src
RUN ./mvnw clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN groupadd -r internflow && useradd -r -g internflow internflow && \
    mkdir -p /app/storage/resumes /app/storage/documents && \
    chown -R internflow:internflow /app

COPY --from=build --chown=internflow:internflow /app/target/*.jar app.jar

USER internflow
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
