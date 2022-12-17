#FROM haproxytech/haproxy-ubuntu:2.6
#COPY . /usr/local/etc/haproxy/
#
#WORKDIR /usr/local/etc/haproxy
## COPY . .
#RUN sed -i -e 's/\r$//' ./install.sh
#RUN ["chmod", "+x", "./install.sh"]
#RUN ./install.sh luaoauth
## USER haproxy
#ENTRYPOINT ["/docker-entrypoint.sh"]
#CMD ["haproxy", "-f", "/usr/local/etc/haproxy/haproxy.cfg"]

FROM haproxytech/haproxy-ubuntu:2.6

WORKDIR /usr/local/etc/haproxy/
COPY ./install.sh /usr/local/etc/haproxy/

RUN sed -i -e 's/\r$//' ./install.sh
RUN ["chmod", "+x", "/usr/local/etc/haproxy/install.sh"]
RUN /usr/local/etc/haproxy/install.sh luaoauth

COPY ./authorization.lua /usr/local/etc/haproxy/
COPY ./cors.lua /usr/local/etc/haproxy/
COPY ./base64.lua /usr/local/etc/haproxy/
COPY ./haproxy.cfg /usr/local/etc/haproxy/

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["haproxy", "-f", "./haproxy.cfg"]