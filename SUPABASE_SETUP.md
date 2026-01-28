# pHishbone - Supabase Setup Guide

This guide will walk you through setting up Supabase for your pHishbone fish tank calculator project.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Your pHishbone project is built successfully

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"** button
4. Fill in the project details:
   - **Name**: `pHishbone` (or any name you prefer)
   - **Database Password**: Create a strong password and **SAVE IT** - you'll need this!
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is sufficient for development
5. Click **"Create new project"**
6. Wait for project provisioning (~1-2 minutes)

## Step 2: Get Database Connection String

1. In your Supabase project dashboard, navigate to **Settings** (gear icon in left sidebar)
2. Click **"Database"** in the settings menu
3. Scroll to the **"Connection String"** section
4. Select the **"Connection pooling"** tab (**IMPORTANT**: Use connection pooling, not direct connection)
5. Copy the **URI** format connection string
6. Replace `[YOUR-PASSWORD]` in the connection string with your database password from Step 1

   The connection string format will look like:
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

## Step 3: Get Supabase API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. You'll see two important values:

   **a) Project URL**
   - Copy the URL (example: `https://xxxxxxxxxxxxx.supabase.co`)
   
   **b) Project API Keys**
   - Copy the **`anon` `public`** key (it's a long JWT token starting with `eyJ...`)
   - **DO NOT** use the `service_role` key - that's for server-side admin operations only

## Step 4: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled (it should be enabled by default)
3. For development, Supabase provides a built-in email service - no configuration needed
4. For production, you should configure your own SMTP provider (Settings → Auth → SMTP Settings)

## Step 5: Configure Your Application

1. Open `appsettings.json` in the `pHishbone` project
2. Update the configuration values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_POSTGRESQL_CONNECTION_STRING_FROM_STEP_2"
  },
  "Supabase": {
    "Url": "YOUR_SUPABASE_URL_FROM_STEP_3a",
    "Key": "YOUR_ANON_KEY_FROM_STEP_3b"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**Example with actual values:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "postgresql://postgres.abcdefghijk:MyStr0ngP@ssw0rd@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
  },
  "Supabase": {
    "Url": "https://abcdefghijk.supabase.co",
    "Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

## Step 6: Create Database Migration

After configuring your `appsettings.json`, create and apply the database migration:

```powershell
# Navigate to your project directory
cd C:\Users\Chien\Desktop\pHishbone

# Create initial migration
dotnet ef migrations add InitialCreate --project Infrastructure --startup-project pHishbone

# Apply migration to Supabase database
dotnet ef database update --project Infrastructure --startup-project pHishbone
```

This will create the `Users` table in your Supabase PostgreSQL database.

## Step 7: Verify Database Setup

1. Go to your Supabase dashboard
2. Click **"Table Editor"** in the left sidebar
3. You should see a **`Users`** table with columns:
   - `Id`
   - `Username`
   - `Email`
   - `SupabaseUserId`
   - `CreatedBy`, `CreatedTime`
   - `LastUpdatedBy`, `LastUpdatedTime`
   - `DeletedBy`, `DeletedTime`

## Step 8: Run Your Application

```powershell
# Run the application
dotnet run --project pHishbone
```

The API should start successfully. You'll see output like:
```
Now listening on: https://localhost:7XXX
```

## Step 9: Test Authentication (Optional)

Open Swagger UI at `https://localhost:7XXX/swagger` and test:

### Register a User
```http
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!"
}
```

### Login
```http
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "Test123!"
}
```

## Troubleshooting

### Connection Issues
- Verify your connection string is correct
- Ensure you replaced `[YOUR-PASSWORD]` with your actual database password
- Check that you're using the **connection pooling** URI, not the direct connection

### Authentication Errors
- Verify your Supabase URL and anon key are correct
- Check that Email authentication is enabled in Supabase dashboard
- Review application logs for detailed error messages

### Migration Errors
- Ensure `appsettings.json` is configured before running migrations
- Check that your database password is correct
- Verify network connectivity to Supabase

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `appsettings.json` with real credentials to version control
- Use `appsettings.Development.json` for local development
- Use environment variables or Azure Key Vault for production secrets
- The `anon` key is safe for client-side use as it respects Row Level Security (RLS) policies

## Next Steps

After completing this setup:
1. Your authentication system is fully functional
2. Users can register and login
3. User data is synced between Supabase Auth and your local PostgreSQL database
4. You can now build your fish tank calculator features!

---

Need help? Check the [Supabase Documentation](https://supabase.com/docs) or the project's implementation plan.
