#!/bin/bash
nohup sh ./publish-update.sh &
chown 1001 -R /home/"$SFTP_SERVICE_USERNAME"/upload
chown 1001 -R /home/"$SFTP_SERVICE_USERNAME"/upload/products.db
result=$?
echo $result



