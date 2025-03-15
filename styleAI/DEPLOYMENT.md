# Deployment Guide for Style-AI

This guide will help you deploy the Style-AI application on a cloud server using Docker and Nginx.

## Prerequisites

- A cloud server (AWS EC2, DigitalOcean Droplet, etc.)
- Docker and Docker Compose installed on the server
- A domain name (optional, but recommended)

## Setting Up Clerk Authentication

1. **Create a Clerk Account**:
   - Go to [clerk.com](https://clerk.com/) and sign up for an account
   - Create a new application from your dashboard

2. **Configure Your Application**:
   - In the Clerk dashboard, go to your application settings
   - Configure the authentication methods you want to use (Email, Google, GitHub, etc.)
   - Set up your application's URL (this will be your production domain or IP address)

3. **Get Your API Keys**:
   - In the Clerk dashboard, navigate to "API Keys"
   - Copy your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

4. **Configure Redirect URLs**:
   - In the Clerk dashboard, go to "Paths" or "Redirects"
   - Set the following paths:
     - Sign-in URL: `/styleai/login`
     - Sign-up URL: `/styleai/signup`
     - After sign-in URL: `/styleai/dashboard`
     - After sign-up URL: `/styleai/dashboard`

## Deployment Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/style-ai.git
   cd style-ai
   ```

2. **Configure Environment Variables**:
   - Copy the `.env.local.example` file to `.env.local`
   ```bash
   cp .env.local.example .env.local
   ```
   - Edit the `.env.local` file and add your Clerk API keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/styleai/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/styleai/signup
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/styleai/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/styleai/dashboard
   NEXT_PUBLIC_BASE_PATH=/styleai
   ```
   - You can add any additional environment variables needed for your application in this file

3. **Update Nginx Configuration** (if needed):
   - Edit the `nginx.conf` file to match your domain or server IP
   - If you have a domain, uncomment the `server_name` line and replace with your domain

4. **Build and Start the Application**:
   ```bash
   docker-compose up -d --build
   ```

5. **Verify the Deployment**:
   - Open your browser and navigate to your server's IP address or domain
   - You should be redirected to the Style-AI application at `/styleai`

## Environment Variables

All environment variables are managed through the `.env.local` file. The Docker setup is designed to:

1. **Pass all environment variables** from `.env.local` to the container at runtime
2. **Not hardcode any API routes or keys** in the Dockerfile
3. **Allow for easy updates** when new environment variables are needed

This approach provides maximum flexibility for future changes and additions to your API routes and configuration.

## Troubleshooting

### Clerk Authentication Issues

- **Check Environment Variables**: Make sure your Clerk API keys are correctly set in the `.env.local` file
- **Check Clerk Dashboard**: Verify that your application's URL and redirect paths are correctly configured
- **Check Logs**: Use `docker-compose logs styleai` to check for any errors in the application logs

### Nginx Issues

- **Check Nginx Configuration**: Make sure your `nginx.conf` file is correctly configured
- **Check Nginx Logs**: Use `docker-compose logs nginx` to check for any errors in the Nginx logs
- **Check Connectivity**: Make sure your server's firewall allows traffic on port 80

## Updating the Application

To update the application to a new version:

1. Pull the latest changes:
   ```bash
   git pull
   ```

2. Rebuild and restart the containers:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Adding New Environment Variables

If you need to add new environment variables:

1. Add them to your `.env.local` file
2. Restart the application:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

No changes to the Dockerfile are needed when adding new environment variables.

## Backup and Restore

The application data is stored in a Docker volume named `styleai-data`. To backup this data:

1. Create a backup:
   ```bash
   docker run --rm -v styleai-data:/data -v $(pwd):/backup alpine tar czf /backup/styleai-data-backup.tar.gz /data
   ```

2. To restore from a backup:
   ```bash
   docker run --rm -v styleai-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/styleai-data-backup.tar.gz --strip 1"
   ``` 