#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
: "${DB_URL:?Set DB_URL}"
: "${DB_USERNAME:?Set DB_USERNAME}"
: "${DB_PASSWORD:?Set DB_PASSWORD}"
: "${JWT_KEY:?Set JWT_KEY}"
exec java -jar application.jar --spring.config.additional-location=./application-release.yml
