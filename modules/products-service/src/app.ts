import dotenv from 'dotenv'
import { graphQLSchema } from './schema/graphQLSchema'
import { sftpConnection } from './sftp-client/sftp-client'
import SftpClient from 'ssh2-sftp-client'
import ampq from 'amqplib/callback_api'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import responseCachePlugin from '@apollo/server-plugin-response-cache'
import Keyv from 'keyv'
import { KeyvAdapter } from '@apollo/utils.keyvadapter'

dotenv.config()
const PORT = parseInt(process.env.PRODUCTS_SERVICE_PORT!!) || 8080
const rabbitMQServer = process.env.RABBITMQ_SERVICE_HOST || 'example.com'
const rabbitMQAdmin = process.env.RABBITMQ_SERVICE_USER || 'username'
const rabbitMQPassword = process.env.RABBITMQ_SERVICE_PASSWORD || 'password'
const redisUrl =
    process.env.PRODUCTS_SERVICE_REDIS_URL || 'redis://localhost:6379'
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
                                    ).then((_) => {})
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
    const server = new ApolloServer({
        schema: await graphQLSchema,
        cache: new KeyvAdapter(new Keyv(redisUrl)),
        plugins: [responseCachePlugin()],
    })
    const { url } = await startStandaloneServer(server, {
        listen: { port: PORT },
    })
    console.log(`🚀  Server ready at: ${url}`)
}

main().then()
