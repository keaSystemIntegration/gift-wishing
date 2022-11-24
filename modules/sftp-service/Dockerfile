FROM atmoz/sftp:alpine
RUN apk update
RUN apk add inotify-tools
RUN apk add curl
RUN apk add python3
RUN apk add py3-pip
RUN pip install pika
# python script

COPY ./publisher /publisher
# sftp config
COPY ./sftp-config.sh /etc/sftp.d/sftp-config.sh
ARG SFTP_SERVICE_USERNAME
ARG SFTP_SERVICE_PASSWORD
RUN mkdir -p /etc/sftp
RUN echo "$SFTP_SERVICE_USERNAME:$SFTP_SERVICE_PASSWORD:1001" > /etc/sftp/users.conf
# file changes listeern script
COPY ./publish-update.sh /etc/sftp.d/publish-update.sh
RUN ["chmod", "+x", "/etc/sftp.d/publish-update.sh"]
RUN ["chmod", "+x", "/etc/sftp.d/sftp-config.sh"]
EXPOSE 22
ENTRYPOINT ["/entrypoint"]