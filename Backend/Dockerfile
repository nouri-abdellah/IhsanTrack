# Use Node.js version 18
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Command to run your app
CMD ["npm", "start"]