FROM nginx:alpine
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY frontend/src/ /usr/share/nginx/html/
COPY frontend/public/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]