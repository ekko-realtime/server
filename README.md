# ekko server

Ekko server is a websocket server and is used as part of the Ekko realtime service framework. It is designed to be used with the [Ekko client](https://github.com/ekko-live/client). By default, Ekko server listens on `port 3000`, but that can be configured by setting the `PORT` environment variable.

### ekko server auto-scaling

Ekko server is designed to scale and uses Redis for both internode communication and syncing of websocket publishing to all clients connected to the running ekko service. This means you must have a running instance of Redis for full functionality. You can run Ekko server in `DEV` mode by using `npm run dev`, which will run Ekko server as a single node and bypass any functionality for ommunicating via Redis. By default, Ekko server communicates with Redis on `port 6379` using `localhost`, but this can be configured with the `REDIS_PORT` and `REDIS_HOST` environment variables.

When deployed with the full Ekko framework, Ekko servers are run as Fargate tasks on Amazon ECS. See [Ekko deploy](https://github.com/ekko-live/deploy) repo for details.

### authentication with ekko

Ekko server uses JWT authentication for all communication between client and server. See [Ekko client](https://github.com/ekko-live/client) for details on setting up Ekko client apps. Ekko server needs a secret key for decryption, which is passed in as an environment variable `SECRET_KEY`. When using the [Ekko CLI](https://github.com/ekko-live/cli) for deployment, the CDK [`deploy-stack.js`](https://github.com/ekko-live/deploy/blob/main/lib/deploy-stack.js) script creates this key and passes it into the Ekko server instance. To run locally, you will need to provide your own.

### configuring ekko server for use with lambdas

On instance start up, Ekko server reads in configuration data from an S3 bucket for any lambdas that are intended to be used with specific websocket communication channels. This is passed in as an environment variable `S3_BUCKET`. Any updates to this configuration data are done via the Ekko CLI tool, which sends a `PUT` request to the `/associations` API endpoint, passing in `associations.json` as a JWT token.

```
//sample associations.json
{
  "applications": {
    "app_1": {
      "channels": [
        { "channelName": "channel_1", "functionNames": ["capitalize"] },
        { "channelName": "channel_2", "functionNames": ["reverse"] },
        { "channelName": "channel_3", "functionNames": ["emphasize"] },
        {
          "channelName": "channel_4",
          "functionNames": ["capitalize", "reverse", "emphasize"]
        }
      ]
    }
  }
}
```

### modifying ekko server

This repo also includes a `Dockerfile` for making a docker image of the Ekko server. The Ekko deploy repo, used for deploying the entire Ekko framework to AWS via CDK code, uses a docker image made using this file. The location of the docker image is on AWS ECR [here](https://console.aws.amazon.com/ecr/repositories/public/779328198284/ekko_server?region=us-east-1).

If you wish to fork the Ekko server repo and modify, in order to deploy you will need to:

- recreate the docker image by running `docker built -t ekko-server` from the root of this directory.
- upload docker image either to dockerhub or Amazon ECR (we used a public repository on ECR)
- update the Ekko deploy repository to point to the new docker image
