FROM haproxytech/haproxy-ubuntu:2.6
COPY . /usr/local/etc/haproxy/

WORKDIR /usr/local/etc/haproxy
# COPY . .
RUN sed -i -e 's/\r$//' ./install.sh
RUN ["chmod", "+x", "./install.sh"]
RUN ./install.sh luaoauth
#ENTRYPOINT ["docker-entrypoint.sh"]

#USER haproxy
CMD ["haproxy", "-f", "./haproxy.cfg"]