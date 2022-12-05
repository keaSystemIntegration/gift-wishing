FROM haproxytech/haproxy-ubuntu:2.6
COPY . /usr/local/etc/haproxy/

WORKDIR /usr/local/etc/haproxy
# COPY . .
RUN sed -i -e 's/\r$//' ./install.sh
RUN ["chmod", "+x", "./install.sh"]
RUN ./install.sh luaoauth
# USER haproxy
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["haproxy", "-f", "/usr/local/etc/haproxy/haproxy.cfg"]