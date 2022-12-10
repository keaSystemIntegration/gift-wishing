

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
