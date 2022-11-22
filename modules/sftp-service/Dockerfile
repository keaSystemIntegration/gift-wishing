FROM atmoz/sftp:alpine
RUN apk update
RUN apk add inotify-tools
RUN apk add curl
RUN apk add python3
RUN apk add py3-pip
RUN pip install pika
# python script

COPY ./publisher /publisher
COPY ./users.conf /etc/sftp/users.conf
# sftp config
COPY ./sftp-config.sh /etc/sftp.d/sftp-config.sh
RUN sed -i -e 's/\r$//' /etc/sftp.d/sftp-config.sh

# file changes listeern script
COPY ./publish-update.sh /etc/sftp.d/publish-update.sh
RUN sed -i -e 's/\r$//' /etc/sftp.d/publish-update.sh
RUN ["chmod", "+x", "/etc/sftp.d/publish-update.sh"]
EXPOSE 22
ENTRYPOINT ["/entrypoint"]