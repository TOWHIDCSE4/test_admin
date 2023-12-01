#!/bin/sh

echo "Start CI backend prod"
docker build -t docker.pkg.github.com/ispeakvn/ispeak-backend/ispeak-admin:main -f Dockerfile-Prod .
docker push docker.pkg.github.com/ispeakvn/ispeak-backend/ispeak-admin:main
echo "Done CI"