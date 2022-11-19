FROM rabbitmq:3.11-management


COPY definitions.json /etc/rabbitmq/definitions.json

COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf

CMD ["rabbitmq-server"]