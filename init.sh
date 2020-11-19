#!/usr/bin/env bash

yum update -y
sudo yum install docker -y
service docker start
usermod -a -G docker ec2-user

echo starting docker compose download
curl -L https://github.com/docker/compose/releases/download/1.25.5/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
echo finished docker compose download

ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
source /.nvm/nvm.sh
nvm install node
ln -s /usr/bin/nodejs /usr/bin/node
node -e "console.log('Running Node.js ' + process.version)"
# npm install
npm i -g npx
