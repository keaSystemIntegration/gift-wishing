#!/bin/bash
echo "publish update is running"
while inotifywait -e close_write /home/"$SFTP_SERVICE_USERNAME"/upload/products.db;
do
  python3 /publisher/send.py ;
  echo "db got updated"
done &
