Structure of our services
for example:
Language, modules(?), stuff used, databases,.. technologies.
Anything we'd like to remember if we were going to do it again.
Environment Variables
Purpose

-   Integrates with what?
-   Used to do this in the overall system.
    Links to deployed version if applicable.

## Auth Service

The Auth Service is given the purpose of providing the client application access to the rest of our services. It does that in synergy with the proxy service. The first endpoints the client would hit are the ones from this service. This would take place during the ***Sign In*** / ***Sign Up*** operations. After performing the aforementioned actions, the client receives an ***Authorization*** **token** to be used in other subsequent requests.

### Pre-Requisites

* Node
* Docker
* IDE / Code Editor
* [MongoDB Cloud Atlas Account](https://cloud.mongodb.com/)
* MongoDB IP Address Whitelisting

### Server & Flow of Events
The server was built using `Node` and `Express` as the core pieces, together with a few dependencies solely focused on the purpose of the service: Authentication.

![Signup_Flow](./overview_of_the_system/Signup_Flow.png)

### Dependencies

| Package name        | Version     |
|---------------------|-------------|
| axios               | ^1.1.3      |
| bcryptjs            | ^2.4.3      |
| express             | ^4.18.2     |
| jsonwebtoken        | ^8.5.1      |
| mongoose            | ^6.7.2      |
| dotenv              | ^16.0.3     |

### Database
The database type used for this service was `NoSQL`, precisely a `Document Database`: ***MongoDB***.

First and foremost, a cluster needs to be created on your Cloud Atlas account. Then you can create a collection inside the cluster, which, for this service, is the only one we actually need.

Inside the Express server, we connect to the database using `mongoose`, which is a MongoDB Object Modelling Tool. We do this using the connection string provided by our cluster as follows:

``` javascript
import mongoose from 'mongoose';

const mongoURI = `mongodb+srv://${process.env.AUTH_SERVICE_MONGO_USERNAME}:${process.env.AUTH_SERVICE_MONGO_PASSWORD}
@gift-wish-auth.rpteshg.mongodb.net/${process.env.AUTH_SERVICE_MONGO_DATABASE}?retryWrites=true&w=majority`;

try {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  mongoose.connection.on('connected', () => {
    console.log('Successfully connected to the mongo db instance');
  });
} catch (error) {
  console.log('Unable to connect to the database:', error);
}
```

`AuthUser` Schema:

``` javascript
    _id: ObjectId(String),
    email: String,
    name: String,
    username: String,
    password: String
```
*Note: `_id` is implicit and doesn't have to be manually set in an `AuthUser` Object. The other fields are required.

### Environment Variables
```
APPID=
AUTH_SERVICE_MONGO_USERNAME=
AUTH_SERVICE_MONGO_PASSWORD=
AUTH_SERVICE_MONGO_DATABASE=
AUTH_SERVICE_JWT_SECRET=
```

### Local Installation
Depending on whether you want to run the service by itself or together with all the other services, the installation can differ a bit. For a self-contained installation (not recommended), all you would have to do following the cloning of the repository would be: 

``` bash
$ cd modules/auth-service
```
``` bash
$ npm install
```

However, for a complete showcase, it is advisable to use the docker setup instead. So, after opening the repository:
``` bash
$ docker-compose up --build
```

*Note: It is not necessary to specify the file in the command above, since the CLI will use the default `docker-compose.yml` we have inside our project directory.

### Local Usage

This service runs on `Port 4500`, based on the environment set in the `docker-compose.yml` file.

## Products Service

Products service is a microservice that responsible for communication between a client and a SqlLite database.
Please make sure that you have theis running on your machine before starting the service:

-   node version 18 install
-   pnpm install [installation guide](https://pnpm.io/installation)
-   RabbitMQ service up and running
-   optional: Redis

The microservice is exposing a graphql server on port 8080 by default, or any port that will be specified in
the environment variables by the key `PRODUCTS_SERVICE_PORT`. The products microservice needs to know where
the SqlLite file is located, and it can be specified as environment variable under the key `PRODUCTS_SERVICE_DATABASE_URL`.

For lunching the server, please make sure that you have a RabbitMQ server, with exchange under the name `update-db`
The connection to the RabbitMQ server can be specified in the environment variables under `RABBITMQ_SERVICE_HOST` ,
`RABBITMQ_SERVICE_USER` and `RABBITMQ_SERVICE_PASSWORD`.

If you would like to add Redis, the default connection string is `redis://localhost:6379` otherwise you can change
it in the environment variable `PRODUCTS_SERVICE_REDIS_URL`

After all the services in place you can run `pnpm dev`

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

After you add theis lines, you can execute `npx prisma db pull` and the object types will be generated automatically.
The next step is to run `npx prisma generate`, this will generate the client library for access the database.

Since the products service is using typescript, one of the library that this service uses is TypeGraphQL. TypeGraphQL helps
to generate from classes in Typescript the graphql schema. For more information please
[read here](https://typegraphql.com/docs/introduction.html#why).

For creating graphql endpoints we use [Apollo](https://www.apollographql.com/docs/). It is providing
a simple API for integration with nodeJS. Apollo jas a straight forwards setup and easy to maintain.

To add a caching layer we used [Keyv](https://www.npmjs.com/package/keyv) which works with json objects. Apollo server

## SFTP

The SFTP service used for receiving and storing SqLite files. The main file that this server is responsible for storing
is `products.db`. In addition, the SFTP file should be able to inform other services if the products.db file has been 
change.

To run the SFTP container, please install first Docker. After you install Docker, you can build the `Dockerfile` with

`docker build --build-arg SFTP_SERVICE_USERNAME=${user} --build-arg SFTP_SERVICE_PASSWORD=${password} -t ${image-name} .`

and run it with

`docker run -dp 22:22 ${image-name}`

The base image of SFTP that we are using is `atmoz/sftp` which can gives us the base sftp capabilities, in addition for
customisation.

In the SFTP image there is three scripts:

`sftp-config.sh`: A bash script that runs on the image initialization, and responsible for changing access level of the
sftp storage. The access granted to the user that logs into the server and gives the right to modified his set directory.

`publish-update`: This script is responsible for listening to a change on the user's products file. The script uses
the library `inotify-tools`. when the file is being change it will execute the python script `send.py`

`send.py`: A python script that send a message into the exchange point upload-db in the RabbitMQ server.

## RabbitMQ

Uses for asynchronous communication between the SFTP service and the products service. The service RabbitMQ service uses 
the default management package which provide in addition to the RabbitMQ, a UI where you can visualize the exchanges and users. 
The management UI used for creating the additional users and exchanges. 
To run the RabbitMQ server you can execute ``docker build -t ${image-name} . `` and to run the image ``docker run -d -p 5672:5672 15672:15672 ${image-name}``. 
If you would like to access the UI please have a look in the username and password in the environment variables. 

## Redis
Redis is used for caching queries for the products service. to start container of redis please insert in your terminal
``docker build -t ${image-name} . `` and to run the image ``docker run -d -p 5672:5672 15672:15672 ${image-name}``.

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
docker-compose.yml/deployment-docker-compose.yml.

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

## Wishlist Service
In this section, it will be presented the technologies used in building the wishlist service, its environment variables, dependencies,  docker setup, and an explanation of how the service was created.

### Technologies
This service has been implemented to provide the client the possibility to manipulate wishlists through API calls. The server has been created with Nodejs using express to serve the application and having the data stored into a MongoDB database. The mongoose library has been also used as an object data modeling (ODM) to manage the data in an easier manner.

### Environment variables needed for the user service
```text
WISHLIST_CONNECTION_URL
WISHLIST_SERVICE_PORT
```
These environmental variables have been created to hide the port number and the connection url used to connect with the database.

### Internal dependencies
Wishlist Service is using the following internal dependencies:
| Package name        | Version     |
|---------------------|-------------|
| express             | ^4.18.2     |
| mongoose            | ^6.7.2      |
| dotenv              | ^16.0.3     |
| cookie-parser       | ^1.4.6      |

### Docker setup 
Friend service is using a dockerfile which has 2 stages, one for development and one for production. These 2 instruct the docket compose how to build the container. The lines are executed sequentially, so first, the development environment will be containerized. Then, if the product stage is specified in docker compose file, it will copy the everything from the development container and use it as the root project, applying only the production dependencies.

### How was created

The service was implemented to provide to the client the possibility to read, create, update or delete wishlists from the database.

From the server side perspective, when a client requests to read a specific wishlist, the system checks if the user's id already belongs to an existing wishlist, in which case it will return it back to the user. Otherwise, a new wishlist will be created. This is possible because, at this point, we know the user is authenticated and authorized to do this operation. 

Besides this, the user is also able to update their wishlist with products that are stored in the products service. However, if the user decides to erase their account, the wishlist associated to this account can be removed as well from the database.

## Friend Service
In this section, we’ll go over the technologies used in building the friends service, its dependencies, environment variables,  docker setup, and an explanation of how the service was created.

### Technologies
This service has been implemented to offer the client the possibility to display the social statuses of a user's friends in real time without reloading the page. The server has been implemented with Nodejs using express, http and Socket.io libraries. Besides this, Typescript was also used to add an extra layer of security and to catch potential errors.

### Environment variables needed for the user service
```text
FRIEND_STATUS_SERVICE_PORT
```
This environment variable has been created to hide the port number.

### Internal dependencies
Friends Service is using the following internal dependencies:
| Package name         | Version     |
|----------------------|-------------|
| express              | ^4.18.2     |
| socket.io            | 4.5.3       |
| dotenv               | ^16.0.3     |
| cookie-parser        | ^1.4.6      |
| @types/cookie-parser | ^1.4.3      |
| @types/express       | ^4.17.14    |
| ts-node-dev          | ^2.0.0      |
| ts-node              | ^10.9.1     |
| rimraf               | ^3.0.2      |
| typescript           | ^4.9.3      |

### Docker setup
Friend service is using a dockerfile which has 2 stages, one for development and one for production. These 2 instruct the docket compose how to build the container. The lines are executed sequentially, so first, the development environment will be containerized. Then, if the product stage is specified in docker compose file, it will copy the ./dist directory from the development container and use it as the root project, applying only the production dependencies.

### How was created
The service is designed so that when an authorized user connects, he/she will see their list of friends and their online status ('online', 'offline', 'not registered'). At the same time, the user will be seen by his/her online friends with the status 'online'. 

Another aspect is that even though an user opens multiple tabs or logs in from different devices, their status will switch to 'offline' only when all the instances have been closed.

Internally, when a client application is open, an event is automatically emitted to this service. With this event, the client should pass an object which contains the list of friends identified through their id's. On the server side, the user id, which is obtained from the cookie claims, is used to create a new socket room. This is really important because the rooms are stored into a global variable which can be accessed by any room.

After this, a function will return back an array with the list of friends and their online status. Inside this function, the algorithm loops through the list of friends and determines the online status of each friend based on a couple of conditions. 

One of them is the existence of the friend's username. If this value is null, this means the user sent an invitation link to an email address which was not accepted by this person. This happens because, once the invitation is sent, a new user will be automatically created in the user service and added as a friend of the inviter. Until the invitation is accepted and an account is created, this new user will only contain the email of the invitee. Thus, a status of 'not registered' will be added to this friend.

The other one is the existence of a socket room with the same id as the friend's. This is why we mentioned the importance of a global variable for socket rooms. Once an user becomes online, their id is added to this global variable which will help the server to determine which friend is either online or offline. In case the socket room (which is the friend's id) exists, an 'online' status will be added to this friend and an event will be sent to the client which will inform the friend that the user is online. Otherwise, the function simply adds the status of 'offline' for this friend. 

Then, at the end of this event, another event will be emitted to the client, sending an array with the current social statuses. 

The last event is triggered when a user closes the website. When this happens, the server will loop through the list of friends and will emit to all the online friends, the 'offline' status of the user. This action is executed only if the user has closed all the open tabs with this application including all the devices where is logged in.
