FROM node:latest

LABEL maintainer="Orlov Dmitry"

ARG WWWUSER=1000

USER root

# переключаем Ubuntu в неинтерактивный режим, чтобы избежать лишних запросов
ENV DEBIAN_FRONTEND noninteractive

# устанавливаем локаль
RUN apt-get update && apt-get install -y locales && rm -rf /var/lib/apt/lists/* \
	&& localedef -i ru_RU -c -f UTF-8 -A /usr/share/locale/locale.alias ru_RU.UTF-8

ENV LANG ru_RU.UTF-8

RUN apt-get update && apt-get install -y \
        curl ca-certificates \
        wget \
        git \
        gzip \
        supervisor \
        zip unzip sqlite3 \
        zlib1g-dev \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libwebp-dev \
        libonig-dev \
        libzip-dev \
        libmcrypt-dev \
        jpegoptim optipng pngquant gifsicle \
        libreoffice-writer \
        imagemagick \
        openssh-client

RUN apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN #useradd -G www-data,root -u $WWWUSER -d /var/www/web web

RUN mkdir -p "/var/www/web"
RUN chown -R $WWWUSER:$WWWUSER "/var/www/web"
RUN mkdir "/var/www/web/.npm"
RUN mkdir "/var/www/web/.config"
RUN chown -R $WWWUSER:$WWWUSER "/var/www/web/.npm"
RUN chown -R $WWWUSER:$WWWUSER "/var/www/web/.config"

WORKDIR /root/

RUN mkdir -p /root/.ssh
RUN ssh-keygen -q -t rsa -N '' -f /root/.ssh/id_rsa
RUN chmod 700 /root/.ssh/id_rsa
RUN echo "Host github.com\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

RUN npm install -g svgo

USER $WWWUSER:$WWWUSER

WORKDIR /var/www/web/sites/app

CMD npm run start
