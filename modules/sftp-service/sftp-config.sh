#!/bin/bash
nohup sh ./publish-update.sh &
chown 1001 -R /home/"$SFTP_SERVICE_USERNAME"/upload
PRODUCT_FILE="/home/"$SFTP_SERVICE_USERNAME"/upload/products.db"
if ! ([ -f "$PRODUCT_FILE" ]); then
    echo "file $PRODUCT_FILE does not exists"
    touch /home/"$SFTP_SERVICE_USERNAME"/upload/products.db
fi
chown 1001 -R /home/"$SFTP_SERVICE_USERNAME"/upload/products.db
result=$?
echo $result