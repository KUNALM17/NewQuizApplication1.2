# Use a specific Java version for consistency
FROM openjdk:21-jdk-slim

# Set an argument for the JAR file name
ARG JAR_FILE=target/*.jar

# Copy the executable jar file to the container
COPY ${JAR_FILE} app.jar

# Expose the port the app runs on
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java","-jar","/app.jar"]