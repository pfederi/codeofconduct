# Deploying to Vercel with MongoDB Integration

This document explains how to deploy the Pumpfoilers Code of Conduct website to Vercel with MongoDB integration for signature storage.

## Prerequisites

1. A [Vercel](https://vercel.com/) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier is sufficient)

## Setting up MongoDB Atlas

1. Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project (e.g., "Pumpfoilers")
3. Create a new cluster (the free tier M0 is sufficient)
4. Once the cluster is created, click "Connect"
5. Set up connection security:
   - Create a database user with a username and password
   - Allow access from anywhere (or specify IP addresses if preferred)
6. Choose "Connect your application"
7. Copy the connection string (it will look like `mongodb+srv://username:password@cluster.mongodb.net/`)
8. Replace `<password>` with your actual database user password

## Creating the MongoDB Collection

1. In MongoDB Atlas, go to your cluster and click "Collections"
2. Create a new database named "pumpfoiling"
3. Create a collection named "signatories"

## Deploying to Vercel

1. Push your code to a GitHub repository
2. Log in to your Vercel account
3. Click "New Project" and import your GitHub repository
4. In the project settings, add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string with the password included
   - `MONGODB_DB`: `pumpfoiling` (the database name)
5. Click "Deploy"

## Testing the API

Once deployed, you can test the API endpoints:

- `GET /api/hello`: Should return a simple health check response
- `GET /api/signatories`: Should return the list of signatories
- `POST /api/add-signatory`: Adds a new signatory (requires a JSON body with `name` and `location`)

## Local Development with MongoDB

For local development with MongoDB:

1. Create a `.env` file in the root of your project (based on `.env.example`)
2. Add your MongoDB connection details as environment variables
3. Run the development server with `npm run dev`

## Troubleshooting

If you experience issues with the API:

1. Check the Vercel logs in your project dashboard
2. Verify that your MongoDB connection string is correct
3. Make sure your IP address is allowed in the MongoDB Atlas Network Access settings
4. Check that the environment variables are correctly set in Vercel 