# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .

# ---> THIS IS THE NEW LINE TO ADD <---
# This command gives execute permissions to all necessary scripts.
RUN chmod -R +x node_modules/.bin

RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:1.25-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]