# Base image
FROM node as base
# Create app directory
WORKDIR /app
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json ./
# Install app dependencies
RUN npm install
# Bundle app source
COPY . .

RUN npm run build

FROM base as dev
ENV NODE_ENV=development
# Start the server using the production build
CMD ["npm", "run", "start:dev"]

FROM base as prod
# RUN rm -rf ./test
ENV NODE_ENV=production
CMD ["npm", "run", "start:prod"]