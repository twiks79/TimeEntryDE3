# Stage 1: Building the code
FROM node:18 AS builder
WORKDIR /app

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of your app's source code
COPY . ./

# Build the Next.js app
RUN yarn build

# Stage 2: Running the application
FROM node:18
WORKDIR /app

# Create a non-root user and switch to it
RUN adduser --disabled-password myuser
USER myuser

# Copy the build output from the builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["yarn", "start"]
