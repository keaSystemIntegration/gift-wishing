#!/bin/bash
while inotifywait -e close_write /home/"$SFTP_USER"/upload/products.db; do python3 /publisher/send.py ; done &
