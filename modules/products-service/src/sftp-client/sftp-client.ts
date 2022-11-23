import { ConnectOptions } from 'ssh2-sftp-client'
import dotenv from 'dotenv'

dotenv.config()

const { SFTP_SERVICE_URL, SFTP_SERVICE_USERNAME, SFTP_SERVICE_PASSWORD } =
    process.env

export const sftpConnection: ConnectOptions = {
    host: SFTP_SERVICE_URL,
    port: 22,
    username: SFTP_SERVICE_USERNAME,
    password: SFTP_SERVICE_PASSWORD,
}
