# Use official maven/Java 17 image to build the app
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src
# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/helpdesk-1.0.0.jar app.jar
# Expose port 8080 (Render uses this by default or the PORT env var)
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
