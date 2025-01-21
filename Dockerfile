# Stage 1
ARG VITE_APP_BASE_URL=${VITE_APP_BASE_URL}
ARG VITE_APP_TOKEN=${VITE_APP_TOKEN}
FROM node:22-alpine as react-build
WORKDIR /app
COPY . ./
ENV NIXPACKS_NODE_VERSION="22"
ENV NODE_OPTIONS="--max-old-space-size=4096"
ARG VITE_APP_BASE_URL
ARG VITE_APP_TOKEN
RUN yarn
RUN yarn build

# Stage 2 - the production environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=react-build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]