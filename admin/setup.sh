#!/usr/bin/env bash
sudo add-apt-repository ppa:ondrej/php
sudo apt-get update
sudo apt-get install php5.6-fpm

sudo apt-get install nginx
sudo apt-get install mysql-server
sudo apt-get install mysql-client


sudo mysql_secure_installation
echo "Enter mysql pw:"
read mysqlpw
echo "GRANT ALL PRIVILEGES ON *.* TO 'anorwell'@'localhost' IDENTIFIED BY '$mysqlpw';" | sudo mysql -u root -p
echo "create database anorwell;" | mysql -u anorwell -p

sudo apt-get install python-dev python-pip
sudo apt-get install python-mysqldb
sudo apt-get install uwsgi
sudo apt-get install uwsgi-plugin-python

 sudo mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
 sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
 sudo cp nginx/anorwell.com /etc/nginx/sites-enabled/
 
 sudo cp uwsgi/anorwell.ini /etc/uwsgi/apps-enabled/
  
cat > /tmp/config.txt <<- EOM

echo "
 #Database info
host = localhost
user = anorwell
db = anorwell
dbPw = $mysqlpw
#names of db tables
postTable = post
songTable = music
graphTable = graph
songDirectory = /www/src/music/
postsPerPage = 5
#this is sha224(pw).
postPwSha = 37407adc4230292f12303ce9ec0e4b029c3bb1f6ad323a6fe2d6388c
EOM

sudo mv /tmp/config.txt /etc/anorwell.conf
sudo chmod 777 /etc/anorwell.conf

 sudo systemctl restart uwsgi
