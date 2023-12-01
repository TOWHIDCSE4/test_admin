#!/bin/sh

echo "Start CI backend prod"
docker build -t docker.pkg.github.com/ispeakvn/ispeak-backend/ispeak-admin:dev -f Dockerfile .
docker push docker.pkg.github.com/ispeakvn/ispeak-backend/ispeak-admin:dev
echo "Done CI"