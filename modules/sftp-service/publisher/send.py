import pika
import os
credentials = pika.PlainCredentials(os.environ["RABBITMQ_USER"], os.environ["RABBITMQ_PASSWORD"])
connection = pika.BlockingConnection(
    pika.ConnectionParameters(host=os.environ["RABBITMQ_SERVER"],credentials=credentials ))
channel = connection.channel()

channel.exchange_declare(exchange='update-db', exchange_type='fanout')

message = "info: new version of sql file!"
channel.basic_publish(exchange='update-db', routing_key='', body=message)

print(" [x] Sent %r" % message)
connection.close()