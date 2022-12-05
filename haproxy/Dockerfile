#FROM haproxy:2.3

FROM haproxytech/haproxy-ubuntu:2.6
COPY . /usr/local/etc/haproxy/

WORKDIR /usr/src
COPY . .
RUN sed -i -e 's/\r$//' /usr/src/install.sh
RUN ["chmod", "+x", "./install.sh"]
RUN ./install.sh luaoauth
#ENTRYPOINT ["docker-entrypoint.sh"]

#USER haproxy
CMD ["haproxy", "-f", "/usr/local/etc/haproxy/haproxy.cfg"]