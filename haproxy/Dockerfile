FROM haproxytech/haproxy-ubuntu:2.6
WORKDIR /usr/src
COPY . .
RUN sed -i -e 's/\r$//' /usr/src/install.sh
RUN ["chmod", "+x", "./install.sh"]
RUN ./install.sh luaoauth