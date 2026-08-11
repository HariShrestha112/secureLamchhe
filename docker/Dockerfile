## Multi-stage Dockerfile: build frontend and backend, produce a runnable JAR image

### Stage 1: build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/angular.json ./
COPY frontend/ .
RUN npm ci
RUN npm run build -- --configuration production || npm run build

### Stage 2: build backend (with maven) and copy frontend static
FROM maven:3.8.8-eclipse-temurin-17 as backend-build
WORKDIR /workspace
COPY backend/pom.xml ./
COPY pom.xml ./
COPY backend/ ./backend/
# copy built frontend into backend static resources
COPY --from=frontend-build /workspace/frontend/dist/frontend/ backend/src/main/resources/static/
RUN mvn -f backend/pom.xml -DskipTests package -q

### Stage 3: runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /workspace/backend/target/backend-1.0.0-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
