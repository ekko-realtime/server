# Ekko Server

Ekko server is a websocket server and is used as part of the Ekko realtime framework. It is designed to be used with the [Ekko client](https://github.com/ekko-live/client). By default, Ekko server listens on port 3000, but that can be configured by setting the `PORT` environment variable.

## How To Use Ekko Server

If you wish to deploy this server as part of the full Ekko stack, either do so manually from [the deployment repository](https://github.com/ekko-live/deploy/) or (recommended) use [the Ekko CLI tool](https://github.com/ekko-live/cli/).

## Ekko server auto-scaling

Ekko server is designed to scale and uses Redis for both internode communication and syncing of websocket publishing to all clients connected to the running ekko service. This means you must have a running instance of Redis for full functionality. You can run Ekko server in `DEV` mode by using `npm run dev`, which will run Ekko server as a single node and bypass any functionality for communicating via Redis. By default, Ekko server communicates with Redis on port 6379 using `localhost`, but this can be configured with the `REDIS_PORT` and `REDIS_HOST` environment variables.

When deployed with the full Ekko framework, Ekko servers are run as Fargate tasks on Amazon ECS. See the [Ekko deployment](https://github.com/ekko-live/deploy) repository for details.

## Authentication with ekko

Ekko server uses JWT authentication for all communication between client and server. See [Ekko client](https://github.com/ekko-live/client) for details on setting up Ekko client apps. Ekko server needs a secret key for decryption, which is passed in as an environment variable `SECRET_KEY`. When using the [Ekko CLI](https://github.com/ekko-live/cli) for deployment, the CDK [`deploy-stack.js`](https://github.com/ekko-live/deploy/blob/main/lib/deploy-stack.js) script creates this key and passes it into the Ekko server instance. To run locally, you will need to provide your own.

## Configuring ekko server for use with lambdas

On instance start up, Ekko server reads in configuration data from an S3 bucket for any AWS Lambda functions that are intended to be used with specific websocket communication channels. This is passed in as an environment variable `S3_BUCKET`. Any updates to this configuration data are done via the [Ekko CLI tool](https://github.com/ekko-live/cli), which sends a `PUT` request to the `/associations` API endpoint, passing in `associations.json` as a JWT token.

## Modifying ekko server

This repository also includes a `Dockerfile` for making a Docker image of the Ekko server. The Ekko deploy repository, used for deploying the entire Ekko framework to AWS via CDK code, uses a Docker image made using this file. The location of the Docker image is on AWS' Elastic Container Repository (ECR) at `public.ecr.aws/s8v4g8o5/ekko_server:latest`.

If you wish to fork the Ekko server repository and modify code, you will need to do the following in order to deploy:

- recreate the docker image by running `docker built -t ekko-server` from the root of this directory.
- upload docker image either to Dockerhub or Amazon ECR (we used a public repository on ECR)
- update [`lib/deploy-stack.js`](https://github.com/ekko-live/deploy/blob/main/lib/deploy-stack.js) on the Ekko deploy repository to point to the new Docker image
