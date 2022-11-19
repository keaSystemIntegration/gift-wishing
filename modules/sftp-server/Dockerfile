FROM atmoz/sftp
RUN apt-get update && \
    apt-get -y install inotify-tools && \
    apt-get -y install curl && \
    apt-get -y install python3 && \
    apt-get -y install python3-pip && \
    pip install pika


# python script
COPY ./publisher /publisher

# sftp config
COPY ./sftp-config.sh /etc/sftp.d/sftp-config.sh

# file changes listeern script
COPY ./publish-update.sh /etc/sftp.d/publish-update.sh
RUN ["chmod", "+x", "./etc/sftp.d/publish-update.sh"]
EXPOSE 22

ENTRYPOINT ["/entrypoint"]