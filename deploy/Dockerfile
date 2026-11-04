FROM eclipse-temurin:17-jre
WORKDIR /app
COPY application.jar application.jar
COPY application-release.yml application-release.yml
ENV PLATFORM_PROJECT_ROOT=/data
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "application.jar", "--spring.config.additional-location=/app/application-release.yml"]
