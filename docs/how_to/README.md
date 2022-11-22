# How to

## _Local environment_
In order to create the project on your local machine you will need to have docker.
You can find explanation on how to install docker here: https://docs.docker.com/get-docker/ .

After you have installed docker, you will need to set up environment variable.  
To do so, create a .env file on the root directory. The file should be fill out as following:

```
STORAGE_VOLUME_USER=
STORAGE_VOLUME_PASSWORD=
SFTP_SERVICE_PASSWORD=
SFTP_USER=
SFTP_URL=
QUEUE_ENDPOINT=
RABBITMQ_SERVER=
RABBITMQ_USER=
RABBITMQ_PASSWORD=

MONGO_USERNAME=
MONGO_PASSWORD=
MONGO_DATABASE=
JWT_SECRET=
```

In addition, you will need to create a separate .env file in root/modules/user-service
The content of this env file should be as following

```
PORT=

NEO4J_URL=
NEO4J_USERNAME=
NEO4J_PASSWORD=
AURA_INSTANCENAME=

JWT_SECRET=
SIGNUP_URL=
EMAIL_SERVER_URL_LOCAL=
EMAIL_SERVER_URL_PROD=
EMAIL_SERVER_ACCESS=

EMAIL_SERVER_SENDER_EMAIL=
EMAIL_SERVER_SENDER_PASSWORD=
```
To get the official env please contact us.


After you set up the env, locate your terminal in the root directory and execute

```
docker compose up
```

## Online Version

This app can be found online at _________. 
This version is host on azure. 


# Products

The products service is a service that expose for the user a graphql endpoint where it can fetch a list of products 
or a single product by id. 
After initialising the app the documentation for the graphql server can be found in http://localhost/products/graphql

The products are stored in a single table in the sql server. the structure is as following 

| id     | name | sub_title | description | category | sub_category | price  | link  | overall_rank |
|--------|------|-----------|-------------|----------|--------------|--------|-------|--------------|
| TEXT   | TEXT |  TEXT     | TEXT        | TEXT     | TEXT         | REAL   | TEXT  | REAL         |


The database type is sqlite that exist inside the products service. If you would like to update the db and create new 
entry you should follow the current schema that describe in the table above. 
To upload the new db you should access the sftp server and replace the current db file with a new file. The file name
has to be ```products.db```. The product service is listing to a que and in a case that there is a new message in that
que, it will update the db

The sftp service can be access on localhost:22. The sftp server connected to a que (RabbitMQ) and in a case that the 
```products.db``` has been updated it will add a message to the que 

In case that you would like to change the current db structure please contact the development team, and we will update it 
as you wish. 