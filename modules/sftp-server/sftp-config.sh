#!/bin/bash
mkdir /home/"$SFTP_USER"/upload
nohup sh ./publish-update.sh &
chown 1001 -R /home/"$SFTP_USER"/upload
result=$?
echo $result



