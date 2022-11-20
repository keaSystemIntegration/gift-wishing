#!/bin/bash
nohup sh ./publish-update.sh &
chown 1001 -R /home/"$SFTP_USER"/upload
chown 1001 -R /home/"$SFTP_USER"/upload/products.db
result=$?
echo $result



