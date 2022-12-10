

Structure of our services
for example:
Language, modules(?), stuff used, databases,.. technologies.
Anything we'd like to remember if we were going to do it again.
Environment Variables
Purpose
- Integrates with what?
- Used to do this in the overall system.
Links to deployed version if applicable.

  
## Products Service

Products service is a microservice that responsible for communication between a client and a SqlLite database. 
Please make sure that you have theis running on your machine before starting the service:
- node version 18 install
- pnpm install [installation guide](https://pnpm.io/installation)
- RabbitMQ service up and running
- optional: Redis

The microservice is exposing a graphql server on port 8080 by default, or any port that will be specified in 
the environment variables by the key ``PRODUCTS_SERVICE_PORT``. The products microservice needs to know where
the SqlLite file is located, and it can be specified as environment variable under the key ``PRODUCTS_SERVICE_DATABASE_URL``.

For lunching the server, please make sure that you have a RabbitMQ server, with exchange under the name ``update-db``
The connection to the RabbitMQ server can be specified in the environment variables under  ``RABBITMQ_SERVICE_HOST`` ,
``RABBITMQ_SERVICE_USER`` and ``RABBITMQ_SERVICE_PASSWORD``. 

If you would like to add Redis, the default connection string is ``redis://localhost:6379`` otherwise you can change
it in the environment variable ``PRODUCTS_SERVICE_REDIS_URL``

After all the services in place you can run ``pnpm dev``

The products service is using typescript that provides better development experience and helps to catch errors before compiling 

The Products service uses [Prisma](https://www.prisma.io/docs) as ORN which helps to create types for the data in the database. 
To get start with Prisma all that need to be specified is this part of the schema.Prisma 
```
generator client {
  provider = "prisma-client-js"
  output = "./client"
}

datasource db {
  provider = "sqlite"
  url      = env("PRODUCTS_SERVICE_DATABASE_URL")
}
```
After you add theis lines, you can execute ``npx prisma db pull`` and the object types will be generated automatically. 
The next step is to run ``npx prisma generate``, this will generate the client library for access the database.

Since the products service is using typescript, one of the library that this service uses is TypeGraphQL. TypeGraphQL helps
to generate from classes in Typescript the graphql schema. For more information please 
[read here](https://typegraphql.com/docs/introduction.html#why).

For creating graphql endpoints we use [Apollo](https://www.apollographql.com/docs/). It is providing 
a simple API for integration with nodeJS. Apollo jas a straight forwards setup and easy to maintain.

To add a caching layer we used [Keyv](https://www.npmjs.com/package/keyv) which works with json objects. Apollo server
 
## SFTP
The SFTP service used for receiving and storing SqLite files. The main file that this server is responsible for storing 
is ``products.db``.

To run the SFTP container, please install first Docker. After you install Docker, you can build the ``Dockerfile`` with 

```docker build --build-arg SFTP_SERVICE_USERNAME=${user} --build-arg SFTP_SERVICE_PASSWORD=${password} -t ${image-name} .```

and run it with 

``docker run -dp 22:22 ${sftpimagename}`` 

The base image of SFTP that we are using is ``atmoz/sftp`` which can gives us the base sftp capabilities, in addition for
customisation. 

In the SFTP image there is three scripts:

``sftp-config.sh``: A bash script that runs on the image initialization, and responsible for changing access level of the 
sftp storage. The access granted to the user that logs into the server and gives the right to modified his set directory. 

``publish-update``: This script is responsible for listening to a change on the user's products file. The script uses 
the library ``inotify-tools``. when the file is being change it will execute the python script ``send.py``

``send.py``: A python script that send a message into the exchange point upload-db in the RabbitMQ server.

## User Service
In this section we’ll go over the technologies used in building the user service, it’s dependencies, structure, docker setup, and environment variables.

### Internal dependencies
The user service is built using NodeJS, with TypeScript and ExpressJS.
User Service internal dependencies are as follows:

| Package name        | Version     |
|---------------------|-------------|
| @azure/storage-blob | 12.12.0     |
| axios               | 1.1.3       |
| dotenv              | 16.0.3      |
| express             | 4.18.2      |
| jsonwebtoken        | 8.5.1       |
| multer              | 1.4.5-lts.1 |
| neo4j-driver        | 5.2.0       |
| uuid                | 9.0.0       |
| cookie-parser       | 1.4.6       |
| ts-node-dev         | 2.0.0       |
| ts-node             | 10.0.1      |
| rimraf              | 3.0.2       |


These dependencies include both production dependencies and development dependencies. Most notable development dependencies are ts-node, ts-node-dev, and rimraf. Modules ts-node and ts-node-dev were imported for running TypeScript, and together offer cool functionalities such as ‘hot reload’, even when running inside docker containers. Command script for hot reload inside a docker container ```ts-node-dev --poll <path/app.ts>```. The module rimraf, was imported to properly get rid of the ```./build``` directory before rebuilding the project using the ```tsc``` command. We had some trouble rebuilding properly, so this module came to the rescue.

### Structure
Structure src directory inside the user service
```text
.
├── database
|   └── neo4j.ts
├── middleware
|   ├── profile-picture-guard.ts
|   └── user-guard.ts
├── models
|   ├── enums
|   |   └── FriendStatus.ts
|   ├── Email.ts
|   ├── Friend.ts
|   ├── InviteToken.ts
|   └── User.ts
├── repositories
|   ├── friend-repository.ts
|   ├── invite-repository.ts
|   ├── relationship-repository.ts
|   └── user-repository.ts
├── routes
|   ├── friend-routes.ts
|   ├── invite-routes.ts
|   ├── profile-picture-routes.ts
|   ├── relationship-routes.ts
|   └── user-routes.ts
├── services
|   ├── email-server-service.ts
|   ├── friend-service.ts
|   ├── invite-service.ts
|   ├── jwt-service.ts
|   ├── profile-picture-service.ts
|   ├── relationship-service.ts
|   └── user-service.ts
├── templates
|   └── email-invitation-templates.ts
├── validation
|   └── input-validation.ts
├── app.ts

```

### Docker setup
User service makes use of two docker compose files, one for development and one for production. Within the dockerfile, 
we have ‘stages’ for development and production that instruct docker compose how to build the container. It will start 
from the top down, first containerizing the development environment, and if instructed to run the production stage, 
it will use the newly created ```./build``` directory from the development container, as the root project for the 
production container, using only production dependencies.  
For details, inspect the dockerfile in ```user-service``` in the module directory, and docker-compose.dev.yml and 
docker-compose.yml/deployment-docer-compose.yml.

### External dependencies
#### Neo4j:
User service stores all user data in a Neo4j graph database except for the user's profile picture.

Neo4j has unique constraints for ```username, email and userId```.

Node structure is quite simple:
```USER-[FRIENDS_WITH]->USER``` where the ```USER``` node contains all relevant information about the 
user: ```userId, name, username, email and signupDate``` while the ```FRIENDS_WITH``` 
relationship contains all relevant information about user relationships: ```status, and originatorUserId```.

The ```status``` in relationship holds enum values found in ```FriendStatus.ts``` in the source code. 
While ```originatorUserId```represents the user that sent a friend request to the other user. For further details, 
see ```docs/documents/instructions.md```.

#### Azure blob storage:
User service stores all user profile pictures in azure blob storage. Saving the files in the format ```<username>_profile-picture.png```.
The file format extension ```.png``` is hard coded.

#### Email Service:
User service uses an external dependency to send emails for when users want to invite other users to join the application.
When/if a user accepts the invite, they will automatically be friends, persisted in the Neo4j database.

### Environment variables needed for the user service
```text
USER_SERVICE_PORT=
USER_SERVICE_NEO4J_URL=
USER_SERVICE_NEO4J_USERNAME=
USER_SERVICE_NEO4J_PASSWORD=
USER_SERVICE_AURA_INSTANCENAME=
USER_SERVICE_JWT_SECRET=
USER_SERVICE_SIGNUP_URL=
EMAIL_SERVER_URL_LOCAL=
EMAIL_SERVER_URL_PROD=
EMAIL_SERVER_ACCESS_TOKEN=
EMAIL_SERVER_SENDER_EMAIL=
EMAIL_SERVER_SENDER_PASSWORD=
```
