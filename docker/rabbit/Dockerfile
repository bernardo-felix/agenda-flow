FROM rabbitmq:management

RUN apt-get update && \
    apt-get install -y curl unzip

RUN curl -L https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v4.0.2/rabbitmq_delayed_message_exchange-4.0.2.ez -o /plugins/rabbitmq_delayed_message_exchange-4.0.2.ez

RUN rabbitmq-plugins enable rabbitmq_delayed_message_exchange

EXPOSE 5672 15672
