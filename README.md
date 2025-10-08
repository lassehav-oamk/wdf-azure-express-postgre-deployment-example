# Azure PostgreSQL Greetings API

A simple Express.js REST API that demonstrates how to connect to Azure PostgreSQL Database. This API allows you to read and create text greetings.

## Features

- **GET** `/api/greetings` - Retrieve all greetings
- **POST** `/api/greetings` - Create a new greeting

## Prerequisites

- Node.js (v14 or higher)
- An Azure account
- Azure CLI installed (optional but recommended)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file with your Azure PostgreSQL credentials:

```env
DB_HOST=your-server.postgres.database.azure.com
DB_DATABASE=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
DB_PORT=5432
PORT=3000
```

### 3. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## Azure Deployment Guide

### Step 1: Create an Azure Database for PostgreSQL

1. **Log in to Azure Portal**
   - Go to [https://portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create PostgreSQL Database**
   - Click "Create a resource"
   - Search for "Azure Database for PostgreSQL" and select it
   - Choose "Flexible Server" (recommended)
   - Click "Create"

3. **Configure Database Settings**
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing (e.g., `greetings-api-rg`)
   - **Server Name**: Choose a unique name (e.g., `greetings-postgres-[yourname]`)
   - **Region**: Choose a region close to you
   - **PostgreSQL version**: 15 or 16 (recommended)
   - **Workload type**: Select "Development" for lower costs
   - **Compute + storage**:
     - Select "Burstable" tier
     - B1ms (1-2 vCores, cheapest option for development)
   - **Authentication**: PostgreSQL authentication
     - **Admin username**: Enter username (e.g., `pgadmin`)
     - **Password**: Enter a strong password
   - Click "Next: Networking"

4. **Configure Networking**
   - **Connectivity method**: Select "Public access"
   - **Firewall rules**:
     - Check "Allow public access from any Azure service within Azure to this server"
     - Click "Add current client IP address" to add your IP
   - Click "Review + create"
   - Click "Create" (deployment takes 5-10 minutes)

5. **Create the Database Schema**
   - Once deployed, go to your PostgreSQL Flexible Server resource
   - In the left menu, click "Connect" to see connection details
   - You can use pgAdmin, Azure Cloud Shell, or psql to connect:

   **Using Azure Cloud Shell:**
   ```bash
   psql -h your-server.postgres.database.azure.com -U pgadmin -d postgres
   ```

   - Create the database:
   ```sql
   CREATE DATABASE greetings;
   \c greetings
   ```

   - Copy and paste the contents of `sql/schema.sql` to create the table and insert sample data

### Step 2: Create an Azure App Service

1. **Create App Service**
   - In Azure Portal, click "Create a resource"
   - Search for "Web App" and select it
   - Click "Create"

2. **Configure Web App**
   - **Subscription**: Select your subscription
   - **Resource Group**: Use the same as your database (e.g., `greetings-api-rg`)
   - **Name**: Enter a unique name (e.g., `greetings-api-[yourname]`)
   - **Publish**: Select "Code"
   - **Runtime stack**: Select "Node 18 LTS" or higher
   - **Operating System**: Linux
   - **Region**: Same region as your database
   - **Pricing plan**: Select "Free F1" for development/demo
   - Click "Review + create"
   - Click "Create"

3. **Configure Environment Variables**
   - Go to your App Service resource
   - In the left menu, select "Configuration" under Settings
   - Click "New application setting" for each variable:
     - `DB_HOST`: `your-server.postgres.database.azure.com`
     - `DB_DATABASE`: `greetings`
     - `DB_USER`: `pgadmin` (your admin username)
     - `DB_PASSWORD`: Your database password
     - `DB_PORT`: `5432`
     - `PORT`: `8080` (App Service uses this port)
   - Click "Save" at the top
   - Click "Continue" to confirm restart

### Step 3: Deploy the Application

#### Option A: Deploy using Azure CLI

1. **Install Azure CLI** (if not already installed)
   - Download from [https://docs.microsoft.com/cli/azure/install-azure-cli](https://docs.microsoft.com/cli/azure/install-azure-cli)

2. **Login to Azure**
   ```bash
   az login
   ```

3. **Deploy the code**
   ```bash
   # Navigate to your project directory
   cd azure-api-db

   # Create a zip file of your project
   zip -r deploy.zip . -x "node_modules/*" ".git/*" ".env"

   # Deploy using zip deployment
   az webapp deploy --resource-group greetings-api-rg --name greetings-api-[yourname] --src-path deploy.zip --type zip
   ```

#### Option B: Deploy using Git

1. **Configure Deployment Center**
   - In your App Service, go to "Deployment Center"
   - Select "Local Git"
   - Click "Save"
   - Copy the Git Clone Uri

2. **Get Deployment Credentials**
   - Click on "Local Git/FTPS credentials"
   - Note your username and password (or create new ones)

3. **Push Code to Azure**
   ```bash
   # Add Azure as a remote
   git remote add azure <Git Clone Uri>

   # Push to Azure
   git push azure main
   ```

#### Option C: Deploy from GitHub

1. **Configure Deployment Center**
   - In your App Service, go to "Deployment Center"
   - Select "GitHub"
   - Authorize and select your repository and branch
   - Click "Save"

   Azure will automatically deploy whenever you push to the selected branch.

#### Option D: Deploy using VS Code

1. **Install Azure App Service Extension**
   - Install the "Azure App Service" extension in VS Code

2. **Deploy**
   - Right-click on your project folder
   - Select "Deploy to Web App"
   - Choose your subscription and App Service
   - Confirm deployment

### Step 4: Verify Deployment

1. **Access Your API**
   - Your API will be available at: `https://greetings-api-[yourname].azurewebsites.net`
   - Test the health check: `https://greetings-api-[yourname].azurewebsites.net/`
   - Test greetings endpoint: `https://greetings-api-[yourname].azurewebsites.net/api/greetings`

2. **Check Logs**
   - In App Service, go to "Log stream" to see real-time logs
   - Or use Azure CLI:
     ```bash
     az webapp log tail --name greetings-api-[yourname] --resource-group greetings-api-rg
     ```

## API Usage Examples

### Get All Greetings

```bash
curl https://your-app.azurewebsites.net/api/greetings
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text": "Hello, World!",
      "createdat": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### Create New Greeting

```bash
curl -X POST https://your-app.azurewebsites.net/api/greetings \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from the API!"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 5,
    "text": "Hello from the API!",
    "createdat": "2024-01-01T12:30:00.000Z"
  },
  "message": "Greeting created successfully"
}
```

## Project Structure

```
azure-api-db/
├── config/
│   └── database.js          # Database connection configuration
├── sql/
│   └── schema.sql           # Database schema and sample data
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── package.json             # Node.js dependencies
├── server.js                # Main application entry point
└── README.md                # This file
```

## Troubleshooting

### Connection Issues

- **Error: "Cannot connect to PostgreSQL Server"**
  - Verify firewall rules in Azure PostgreSQL Server settings
  - Check that "Allow public access from any Azure service" is enabled
  - Verify your IP address is added to firewall rules

- **Error: "password authentication failed"**
  - Double-check username and password in environment variables
  - Ensure the PostgreSQL admin credentials are correct
  - Format should be: username (not username@servername)

- **Error: "SSL connection required"**
  - SSL is enabled by default in the configuration
  - Verify `ssl: { rejectUnauthorized: true }` is in your database config

### Deployment Issues

- **App Service not starting**
  - Check environment variables are set correctly
  - View logs in Azure Portal under "Log stream"
  - Ensure `PORT` is set to `8080` in App Service configuration

- **Database connection timeout**
  - Verify the database server name ends with `.postgres.database.azure.com`
  - Check that the database is running and not stopped
  - Verify SSL settings are correct

## Cost Management

- **Free Tier Options**:
  - App Service: F1 Free tier (1GB RAM, 60 min/day)
  - PostgreSQL: Burstable B1ms (~$12-15/month, can be stopped when not in use)

- **Stop/Start Resources**:
  - You can stop the PostgreSQL server when not in use to save costs
  - Free App Service has limited runtime per day

## Security Best Practices

1. Never commit `.env` file to version control
2. Use strong passwords for PostgreSQL admin
3. Regularly update dependencies: `npm audit fix`
4. Consider using Azure Key Vault for production secrets
5. Enable SSL/TLS for database connections (already configured)
6. Implement authentication/authorization for production APIs
7. Use connection pooling to limit database connections (already implemented)

## Additional Resources

- [Azure Database for PostgreSQL Documentation](https://docs.microsoft.com/azure/postgresql/)
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Express.js Documentation](https://expressjs.com/)

## License

ISC
