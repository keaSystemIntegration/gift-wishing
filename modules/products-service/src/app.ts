import express from 'express'
import dotenv from 'dotenv'
import { graphQLSchema } from './schema/graphQLSchema'
import { graphqlHTTP } from 'express-graphql'
import { sftpConnection } from './sftp-client/sftp-client'
import SftpClient from 'ssh2-sftp-client'
import ampq from 'amqplib/callback_api'

dotenv.config()
const PORT = process.env.PORT
const rabbitMQServer = process.env.RABBITMQ_SERVICE_HOST || 'example.com'
const rabbitMQAdmin = process.env.RABBITMQ_SERVICE_USER || 'username'
const rabbitMQPassword = process.env.RABBITMQ_SERVICE_PASSWORD || 'password'

ampq.connect(
    {
        hostname: rabbitMQServer,
        username: rabbitMQAdmin,
        password: rabbitMQPassword,
    },
    (error, connection) => {
        if (error) throw error
        connection.createChannel((error, channel) => {
            if (error) console.log(error)
            const exchange = 'update-db'
            channel.assertExchange(exchange, 'fanout', { durable: false })
            console.log('connection establish')
            channel.assertQueue('', { exclusive: true }, (error, q) => {
                channel.bindQueue(q.queue, exchange, '')
                if (error) console.log(error)
                console.log('q.queue: ', q.queue)
                channel.consume(
                    q.queue,
                    (message) => {
                        console.log(message?.content.toString())
                        const sftp = new SftpClient()
                        sftp.connect(sftpConnection)
                            .then(() => {
                                return sftp.list('/upload')
                            })
                            .catch((reason) => {
                                console.log(
                                    'error has been triggered by sftp server: ',
                                    reason
                                )
                            })
                            .then((data) => {
                                const dbFile = data?.find(
                                    (file) => file.name === 'products.db'
                                )
                                if (dbFile) {
                                    console.log('file will be download shortly')
                                    sftp.fastGet(
                                        `/upload/${dbFile.name}`,
                                        './sqlite/products.db'
                                    )
                                }
                            })
                    },
                    { noAck: true }
                )
            })
        })
    }
)

async function main() {
    const app = express()
    app.use(
        '/graphql',
        graphqlHTTP({ schema: await graphQLSchema, graphiql: true })
    )
    app.get('/', (req, res) => {
        res.send({ message: 'hello world' })
    })

    app.get('/update-db', (req, res) => {
        console.log('good call to me')
        const sftp = new SftpClient()
        sftp.connect(sftpConnection)
            .then(() => {
                return sftp.list('/upload')
            })
            .catch((reason) => {
                console.log('error has been triggered by sftp server: ', reason)
            })
            .then((data) => {
                const dbFile = data?.find((file) => file.name === 'products.db')
                if (dbFile) {
                    sftp.fastGet(
                        `/upload/${dbFile.name}`,
                        './sqlite/products.db'
                    )
                        .then((result: String) => res.send({ message: result }))
                        .catch(() => res.status(500))
                }
            })
            .catch(() => {
                res.status(500)
            })

        /*
        console.log("I have been triggered")
        sftpClient
            .then((data) => {
                const dbFile = data?.find((file) => file.name === 'products.db')
                if (dbFile) {
                    sftp.fastGet(
                        `/upload/${dbFile.name}`,
                        './sqlite/products.db'
                    )
                        .then((result: String) => res.send({ message: result }))
                        .catch(() => res.status(500))
                }
            })
            .catch(() => {
                res.status(500)
            })

*/
    })

    app.listen(PORT, () => console.log('Server is running on: ', PORT))
}

main().then()
