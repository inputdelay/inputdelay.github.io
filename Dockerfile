# Use the official Nginx image as the base
FROM nginx:alpine

# Copy the static site files from the repository to the Nginx html directory
COPY . /usr/share/nginx/html

# Create a custom Nginx configuration file to include headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]