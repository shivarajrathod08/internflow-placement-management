# Build Stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src src
RUN mvn clean package -DskipTests

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
