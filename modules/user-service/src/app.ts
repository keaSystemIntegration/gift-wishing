import express from 'express'
import cookieParser from 'cookie-parser'
import { friendRoutes } from './routes/friend-routes'
import { inviteRoutes } from './routes/invite-routes'
import { relationshipRoutes } from './routes/relationship-routes'
import { userRoutes } from './routes/user-routes'
import { emailServerUrl } from './services/email-server-service'

const app = express()

const port = process.env.PORT
app.use(express.json())
app.use(cookieParser())
app.use('/user', userRoutes)
app.use('/friend', friendRoutes)
app.use('/invite', inviteRoutes)
app.use('/relationship', relationshipRoutes)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`user-service listening on port ${port}`)
    console.log('Environment = ' + process.env.NODE_ENV)
    console.log('Email server = ' + emailServerUrl)
})
