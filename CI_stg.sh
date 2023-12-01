#!/bin/sh

echo "Start CI backend stg"
docker build -t docker.pkg.github.com/ispeakvn/ispeak-backend/ispeak-admin:staging -f Dockerfile-stg .
docker push docker.pkg.github.com/ispeakvn/ispeak-backend/ispeak-admin:staging
echo "Done CI"