# Choices
In this document you can read about the development team decisions regarding architectural, deployment, complexity, 
separation of concerns, and decoupling. 
## Architectural Decisions
![System diagram](./overview_of_the_system/System_Design.png)
The system architecture is a microservice architecture. That allow for each component to be self-isolated and run 
independently. Microservices, helps to achieve scalability, each service can scale by itself on needs, unlike monolithic 
architecture where scaling requires scaling for the entire system.  
In addition, it gives us, the developers the opportunity to separate the workload and takes decisions for 
each component, rather than take decisions as a whole. Inner communication between services is happening through the 
proxy or with a queue, which decouple services from each other.

### Service communication and synchronization
Synchronous vs Asynchronous communication.
Defining when we need synchronous communiaction; when service A needs feedback when communicating with service B.
In cases where service A does not need feedback, we considered asynchronous communication.

For brokerless synchronous communication, we considered REST API and gRPC, both over HTTP.
Speed was considered, however as both REST and gRPC support HTTP 2, the differences would be negligible, if any. Decision was taken to use REST API for communication between services that needed to be synchronous. The reasons being simplicity, technological know-how, and we did not need streaming and bidirectional communication.

For asynchronous communication, we only considered Queue-based communication using Redis or RabbitMQ.
The communication between the product service and the SFTP server use RabbitMQ for communicating an event.
Both brokers have many pros and cons, however there was a con with Redis that was a deal breaker for what we needed. Redis does not guarantee message delivery, and therefore we chose RabbitMQ.


## Deployment Decisions
Our system created with a container base architecture- virtualization. It is an operating system level virtualization 
for deploying and running application. Docker allows us, the developers, to build, run and distribute docker containers. 
Docker helps to reduce complexity of networking between different services, volumes and databases. In addition, docker 
has public images that can be used by other developers, for example haproxy, redis, rabbitMq, and more. 

Docker improves the development experience, developers can just pull and run containers on their own machine without 
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
and high computing power, but slower response after cool down. for example our email service which responsible for sending 
emails on specific events, but does not require instantaneous response, is deployed on serverless architecture with Azure 
Functions. The serverless architecture is used for running a single function, that can be decoupled from other parts of 
the system, but can be triggered by different events. 

## Inner Services Decisions

### Products Service VS SFTP Service
Products service is responsible for providing a products to a client's request over the http protocol with GraphQL server
endpoint. SFTP server is a server where a client can store data and download data. The main idea of the sftp server is 
to expose an endpoint where a client can upload a sqlite database that contains products. When a client would like to 
query the database, it will be accessed through the product service in GraphQL post request. 
Achieving this structure raises some challenges:
 - sqlite is suited for in memory database
 - the products service should access the sftp storage
 - a new database can be inserted to the sftp at anytime
 - notifying the products service that there is a new database 

Firstly to achieve sqlite in memory we needed to create a download capabilities for the product service. By downloading
the sqlite into the products server we could get better performance from the sqlite implementation. But direct communication 
between the SFTP server and the product will couple thies services to decouple them they need to communicate through the 
proxy server. By doing so we are solving the first and the second issue.

However, now when the database is in memory, we reach to the third problem that described above, which mean that there
will might inconsistency between the in-memory database in the products service and a new version of the database on the
SFTP service. To solve this issue we have created a script that listen to the ``products.db`` file and whenever there is 
an updates to this file, it will send a message to the products service. when the products service gets the message, it
will download the file again. 

Now, when solving the constancy issue and the sqlite optimization, we found out that we will have a scalability concern. 
If we scale the products service horizontally and there is a message from the sftp service, only the server that currently 
gets the message (for example in round-robin), will know that there is a new database. In addition, download new database, 
will be an intensive process. 

To answer these issues, we implemented a Pub/Sub with RabbitMQ, that the SFTP publish a message to the exchange point 
about a new database to download, and all the products services are subscribers to that exchange, and they will download 
the new database when the message arrives.
![products vs sftp](./overview_of_the_system/products-sftp-diagram.png)

### Auth Service & Proxy
The Auth Service is in charge of authenticating users into our application, but it doesn't do that by itself, but in combination with the Proxy. The Auth Service only provides the client application with the necessary details to perform secured requests, and it is the Proxy that actually checks the user's identity and performs the authentication per se.

#### Architecture 
Before committing to this approach, our ideas took this part of the application through different iterations. The first assumption was that the Auth Service would be in charge of both, but that's not the most efficient approach when using microservices. We cannot use a middleware inside our Auth Service to authorize requests to other services. And even if we did that, then the Auth Service would almost act like a proxy itself. It was clear that we needed to find a different solution to this.

Then came the 2nd iteration, where we considered having 2 proxies and 2 services working together towards Authentication. At that time, our architecture diagram looked like this:
![Old_diagram](./overview_of_the_system/old_diagram.png)

Basically, the idea was that we would have a `Proxy Outer` that would forward requests to the `Auth Service` or the `Firewall` based on whether they required authorization or not. Then, the `Firewall` would do the same based on whether the authorization succeeded or not and forward to the `Proxy Inner` or the `Auth Service`. Lastly, the `Proxy Inner` would redirect the request to the proper service. It wasn't very obvious at the time we designed this diagram, but it became clearer as the implementation started that this was not it either. Not only it would introduce potential problems, like not being able to send the `user claims` to the services post-authorization, but it would also increase redundancy, and, overall, lower performance, since a request would have to go through multiple layers before actually reaching its destination.

Finally, the latest design is much more simple and also makes more sense. As shown at the beginning of the document, we are now only using a single `Proxy`, that also acts as a `Firewall`, and, of course, one `Auth Service`. The reason this was not our go-to approach initially could be due to our lack of experience in working with proxies, precisely its security features. Basically, we weren't sure if it was actually possible to authorize inside a proxy (for free). This aspect differs from provider to provider, so it is harder to predict without some trial and error. Fortunately, it eventually worked for us, which definitely helped lower the responsibility of the other services as far as authentication is concerned. Moreover, it also became easier to understand from an external viewpoint. 

#### Provider
The choice of the proxy provider was probably not the best decision for us, overall, as it proved to be quite difficult to work with at times. We have used *HAProxy* in our project configuration, and while it is a lightweight solution, with a relatively quick setup, it is very limited once you try to tweak it a bit more. Aside that, it sometimes posed problems during our deployment as well. The most challening part about it was implementing the architecture described above, where, in addition, it has the responsibility of a `Firewall`. The problem here was the fact that *HAProxy* doesn't provide any built-in features to facilitate this and the only path you can follow to achieve this is through the integration of a special script written in `Lua` language.

So, the choice here was, rather, whether to stick with HAProxy, or change the provider altogether, because the script integration raised its own challenges. Debugging with *HAProxy* and `Lua` would not be the most intuitive either, which increased the difficulty of the implementation. 

Eventually, everything worked, so we stuck to it, but for future projects, we would most likely consider other options.

#### Storage
As far as the storage is concerned, the `Auth Service` uses a simple *MongoDB* database, with just one collection of `authusers`. Since we would split the User into 2 types of users in our application (`AuthUser` & `User` - from `User Service`), each with their own responsibility, a fair consideration here was that we should use one of the most simple and flexible options to accommodate our service. Our database would not feature any relationships, so it was pretty obvious that we would use NoSQL for this individual service, at least.

One particular feature of *MongoDB* suitable for this service is the `Flexible Document Schemas` that it provides. Even though our documents have certain required fields, there can be situations when there are more than those specified, and we would want to adjust to that. We even feature such an example in our application (i.e. The Sign Up of a friend who has been invited by a user). Besides that, it is highly scalable, performant, cost-effective, and its setup is very simple, which made this an easy choice.

### User Service
#### Communication
Communication decisions between user service and other services.
As described in the ???how_to??? document, the user service has three external dependencies that we have control over and maintain. The decisions related to these dependencies are mainly how we decided to store images and text relevant for users. These are described here below in this section.

Other decisions were regarding how we keep this service synchronized with other services. So defining who depends on the user service is essential, and is described in more detail in the ???how_to??? document in the Auth Service section, as it is the only service that has user service as a dependency.

The synchronization decision was then between the user service keeping the auth service updated or vice versa. However, going over each services functionality, we see that it is not possible to give one service that responsibility as a whole, we have to do it depending on the use case, so we???ll go over each of them:

**Creating a user.** Auth service is responsible for signing up, and logging in users, so the obvious decision here is for the auth service to keep user service up to date when a user is created.

**Updating and deleting a user.** User service is responsible for updating and deleting a user. Here the user service is responsible for keeping the auth service synchronized.

Referring back to the communications section in this document, we mentioned that we needed synchronized communication, exactly for this reason. And in all three scenarios here above, we don???t want the user to get a success response unless the action the user wanted to take was successful in all services. For example, when a user is signing up for the application, the auth service will have to await confirmation from the user service, that the user has been successfully created, before responding back to the client.

One more communication decision that is related to the user service is its communication with the email service. The user service is responsible for sending invitation emails, and a decision was taken that the communication here should be synchronous for user experience. An asynchronous call from the user service to the email service, could certainly be considered a better approach. We could???ve used RabbitMQ, and configure an email queue to be durable in case of the email service failing. In this scenario, the invitation email would not be lost, however it would be late, so it would be at the expense of user experience.

In fact, we did first create an email service that received email requests from such a queue. However later in the development process, we both realized that the user experience would be sub-optimal, along with problems related to serverless function integration with RabbitMQ, we decided on synchronous communication.

#### Storage decisions
Other significant decisions for the user service was how it would store both user text data and images for users.

*Why Neo4j?*

First, we started by ruling out document databases due to maintenance and synchronization issues with many to many relationships. Therefore our choice was between a relational database and graph database.
Ultimately, we decided on a graph database because of the following reasons:
- Graph databases can be more performant, especially when there are large amounts of many to many relationships.
- Relational databases follow a rigid structure, which is likely to result in slower development due to original database modeling and updates that would occur during development.
- Future scaling opportunities, relational databases are hard to scale.
- Possible feature updates, as we???re building a sort of social platform, if at some point we decide we want to create for example a friend suggestions feature. Traversing a graph database to see friends-of-friends will be much faster and easier than with a relational database.

*Why Azure blob storage?*

First, we discarded the idea of storing the images locally in the user service, because the user service is running in a docker container and is not a valid option for persisting data.

Second, we discarded the idea of storing the images as blobs in a database as it is hard to scale, slow, and expensive.

Third, we discarded the idea of storing images as Base64 strings in a database due to storage cost and increased stress on the database and the overhead from encoding the images slows down the request-response.
Deciding on Azure vs other storage options, was simply a matter of preference and availability for us as students.

### Wishlist Service
For this service, we decided to go with a REST API since the server does not have to communicate with other services or execute complex queries that require to access specific object fields (some of the advantages of using GraphQL).

Even though a REST API is slower than GraphQL in terms of speed and it has no self-documentation of the endpoints, it is easier to be built and maintained since it has better error reporting and it's very scalable and flexible. It is also independent from the client, so that any technologies can be used when developing these 2 parts.

Another aspect we had to consider was the database type. We decided to use a documented database for this service since there is only one table/document (so no relationships/MySQL database) and, intuitively, no in depth queries(Graph Database) that could slow down the response time.

### Friends Service
Friends service is providing an event-based communication between client and server through the web socket protocol. For this, we used the socket.io which is one of the most DX friendly library when it comes to bidirectional communication since it has a well written documentation and an intuitive integration process. Its main responsibility is to offer the client the current status of each user to all his/her friends. 

In initial solution for this issue was to connect each user to the socket server and to broadcast to everyone other user their current status. This could be an easy solution to implement, but quite inefficient when it comes to performance. This is because a lot of events would be emitted to users that are not friends between each other, so the server would consume a lot of resources redundantly (an user can see the status of another user only if they are friends).

A more optimal solution was to use the concept of 'rooms' from socket.io, so that when a user connects, the server creates a room with their user id and based on a list of friends that is passed by the client, it can emit only to the online friends the current user status. This way, the number of events is minimized and can process more operations (a socket.io server can sustain around 10 000 concurrent connections).

In terms of scalability, the socket server can the be scaled horizontally by adding a a mechanism which can keep all the servers in sync. Socket.io provides different integrations such as Redis which would act as a message broker that would pass messages between each server. This way, if 2 friends are connected on 2 different servers, they will push the event to the Redis database which will redirect it to all the subscribed servers.

### Email Service
The biggest choices that were discussed regarding the email service were the email service architecture, communication, and how generic it should be.

#### Architecture
As mentioned in the Architecture section of this document, and in the ```how_to``` document, the email service is a 
serverless function within a function app in Azure. The reason for this is that the email service is not expected to be a busy service, and does not need to be fast. Its primary functionality at the moment is to send invitation emails, and as it is expected to be a relatively rare occasion for a user to send invitation email, compared to the applications other functionalities, we???re okay with it taking a bit of time. So as we???re okay with the architecture's main drawback, and the pros of this architecture being significant, the main one being that it will be very cost efficient, the choice was easy.

#### Communication
Briefly discussed in the user service section in this document, at the start of this project we discussed the idea of having the email service receiving email requests from a durable queue setup with RabbitMQ. 
So the requests to the email service would be asynchronous, with such a setup, we???d have no reason to worry about speed, and we???d decouple this service from other services more distinctly.
However, there were two problems with this approach, at first we had created the email service, sending email from a queue with RabbitMQ, 
and when researching creating the service as an Azure function, we saw that it was 
not possible to integrate an Azure function with RabbitMQ using consumable plan, at least not with NodeJS. 

This in and of itself wasn't a reason to abandon asynchronous communication, 
as we had an option of 
refactoring the code to consume from a Azure Queue Storage with an azure queue trigger function. 

However, there is a big user experience drawback with this approach, 
if the email service fails for some reason, the user would think they sent the invitation, 
while the invite might not be sent until a day or a few days later once the problem is realized and fixed. 
Assuming that the queue storage would successfully persist the message that was supposed to be sent, this wouldn???t be a big issue, 
however it is in our opinion, worse than the alternative HTTP trigger function approach.

#### Generic abilities
This sort of ties to the architectural approach for this function, it would???ve been quite easy to integrate a simple 
email module within the user service and send invitation emails from the user service. 
However, looking forward to possible future features of this application, for example sending birthday reminders, 
wishlist update notifications, etc, this approach was considered significantly better. 
Thinking even further, setting up the email service like this, keeping it as generic as we could manage, 
it is as decoupled as we could imagine, making it easy to reuse the code for this service in other applications, or simply use the same function in other applications.


# Integration Choices

## Auth 

The dillema here was whether to integrate the `Auth Service` the partner group exposed to us, or use an already existing `Auth Provider`. In the end, having our `Client Application` communicate fully with the partner team's services, since there is a high possibility they have some inner rules that would only allow access through their own `Auth Service` (as it is in our case as well).

## Web scraper
Main choices made for the web scraper were in regard to Architecture, programming language, and which web scraping
library to use.

Architecture:
As we don't expect this 'service' needing to be continuously running, and rather a function that should run periodically
we wanted to make this scraper using Function as a Service. 

Language and library:
Most of the project is made with JavaScript, or NodeJS, and was partly the reason we chose to user Python, 
as we wanted to do this service a bit differently. If this were a real company we would most likely have chosen to use 
NodeJS in order to be consistent with language, and not needing developers to know many languages. The other reason
was that we found good guides using Python, library choice was chosen based on the quality of guides and documentation
made by the library developers/contributors.

## Wishes service

We have chosen to work with express library from Nodejs serving static files because of the possibility of having a fast setup and an easy and intuitive integration process. We agreed to work with these technologies since all of our developers team are familiar with HTML, CSS and JavaScript. Though, once we would start to implement more frontend features and have a more complex data manipulation, a frontend library or framework would suit better to maintain the state of the application such as React or Angular.

## Friend path service

The friend path service was another reason for us to use Nodejs serving static files since the integration process was quite straight forward. Also, the documentation from the exposing team was clear and provided a lot of valuable information on how to integrate the service.


