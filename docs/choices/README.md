# Choices
In this document you can read about the development team decisions regarding architectural, deployment, complexity, 
separation of concerns, and decoupling. 
## Architectural Decisions
![System diagram](../overview_of_the_system/System_design.png)
The system architecture is a microservice architecture. That allow for each component to be self-isolated and run 
independently. Microservices, helps to achieve scalability, each service can scale by itself on needs, unlike monolithic 
architecture where scaling required scaling for the entire system.  
In addition, it gives us, the developers the opportunity to separate the workload and takes decisions for 
each component, rather than take decisions as a whole. Inner communication between services is happening through the 
proxy or with a que, which decouple services from each other.

## Deployment Decisions
Our system created with a container base architecture- virtualization. It is an operating system level virtualization 
for deploying and running application. Docker allows us, the developers, to build, run and distribute docker containers. 
Docker helps to reduce complexity of networking between different services, volumes and databases. In addition, docker 
has a public images that can be used by other developers, for example haproxy, redis, rabbitMq, and more. 

Docker improve the development experience, developers can just pull and run containers on their own machine without 
the concerns of installing new software. 
In addition, all docker environment setup in the same way and to move image from development to preproduction and 
production is fairly easy. 
Furthermore, using docker facilitates the creation of microservice architecture, since it is easier to develop and deploy 
separated components.

For production environment, container base architecture, comes with portability in mind, since the whole definition of 
the services stays within the container, that makes deployment on different servers much easier. docker provides a 
self-isolated application, which can only access its own container space, and if any application gets vulnerable, 
it can only harm itself.  

Scalability of container base architecture will demand spinning more containers, and a need for orchestrator, in future 
development we will consider adding kubernetes.

The application is hosted on Azure as a container instances, it is very easy to deploy when using docker compose file.
The containers are stored on Azure Container Registry (ACR). ACR provides fast and private storage for docker images. 
To start deploy the images from ACR the developer can replicate the docker compose environment into self-isolated network
with the same configuration as the local environment. 

Unlike Rest Api, Graphql and proxy, some of our services does not require quick response and can have "cold start", 
while being executed from different events. Those services are deployed as serverless architectures which gives lower cost 
and high computing power, but slower response after cool down. for example our mail service which responsible for sending 
emails on specific events, but does not require instance response, is deployed on serverless architecture with Azure 
Functions. The serverless architecture is used for running a single function, that can be decoupled from other parts of 
the system, but can be triggered by different events. 

## Storage Decisions

## Inner Services Decisions

### Product Service
### SFTP Service
### Proxy Service
### User Service
### Wishlist Service
### Friends Service
### Auth Service