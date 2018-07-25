FROM clutch

ENV NODE_ENV=production

# Install app dependencies
WORKDIR /data/app
COPY package.json /data/app/
RUN yarn

COPY . /data/app

WORKDIR /data/clutch
