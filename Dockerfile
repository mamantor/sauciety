# Use the official Node.js image as the base image.
FROM node:21

# Install MongoDB and Supervisor.
# (This example uses Debian-based commands; adjust if your base image differs.)
RUN apt-get update && \
    apt-get install -y supervisor && \
    rm -rf /var/lib/apt/lists/*


# -----------------------------
# Install MongoDB following the official Ubuntu instructions
# -----------------------------

# Import the MongoDB public GPG key.
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
    gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
    --dearmor

# Create the MongoDB list file for Ubuntu 20.04 (Focal).
RUN echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" | tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Update the package index and install MongoDB.
RUN apt-get update && apt-get install -y mongodb-org

# Copy the Supervisor configuration file into the container.
COPY supervisor.conf /etc/supervisor/conf.d/supervisor.conf

# Set the working directory for your website.
WORKDIR /app

# Copy package files and install dependencies.
COPY package*.json ./
RUN npm install

# Copy the rest of your application code.
# COPY . .

# Expose the port on which your website will run (adjust if needed).
EXPOSE 5173

# Start Supervisor in non-daemon mode to run both MongoDB and your website.
CMD ["/usr/bin/supervisord", "-n"]