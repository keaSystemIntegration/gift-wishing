import {ConnectOptions} from 'ssh2-sftp-client'
import dotenv from 'dotenv'

dotenv.config()

const { SFTP_URL, SFTP_USERNAME, SFTP_PASSWORD } = process.env


export const sftpConnection: ConnectOptions = {
    host: SFTP_URL,
    port: 22,
    username: SFTP_USERNAME,
    password: SFTP_PASSWORD,
}
