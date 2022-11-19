import pika
import os

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host=os.environ["RABBITMQ_SERVER"]))
channel = connection.channel()

channel.exchange_declare(exchange='update-db', exchange_type='fanout')

message = "info: new version of sql file!"
channel.basic_publish(exchange='update-db', routing_key='', body=message)

print(" [x] Sent %r" % message)
connection.close()