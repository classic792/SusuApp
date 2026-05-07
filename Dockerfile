# Stage 1: Build the Frontend (React/Vite)
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

# Stage 2: Build the Backend (Spring Boot)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy frontend build results to Spring Boot's static resources
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

# Copy source code and build the JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 3: Final Runtime Image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Environment variables for DB connection
ENV DB_HOST=db
ENV DB_PORT=3306
ENV DB_NAME=savings_collection
ENV DB_USER=root
ENV DB_PASSWORD=Password133-

ENTRYPOINT ["java", "-jar", "app.jar"]

