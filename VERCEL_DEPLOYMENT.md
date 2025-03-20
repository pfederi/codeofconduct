# Deploying to Vercel with KV Storage Integration

This document explains how to deploy the Pumpfoilers Code of Conduct website to Vercel with Vercel KV storage for signature management.

## Prerequisites

1. A [Vercel](https://vercel.com/) account

## Setting up Vercel KV Storage

1. Log in to your [Vercel](https://vercel.com/) account
2. Go to the Storage tab in your dashboard
3. Click "Create" and select "KV Database"
4. Follow the setup instructions to create a new KV database
5. Once created, you'll receive connection details that will be automatically configured in your Vercel project

## Deploying to Vercel

1. Push your code to a GitHub repository
2. Log in to your Vercel account
3. Click "New Project" and import your GitHub repository
4. In the "Configure Project" step, you'll see an option to connect your KV database
5. Select the KV database you created earlier
6. Click "Deploy"

## Testing the API

Once deployed, you can test the API endpoints:

- `GET /api/hello`: Should return a simple health check response
- `GET /api/signatories`: Should return the list of signatories
- `POST /api/add-signatory`: Adds a new signatory (requires a JSON body with `name` and `location`)

## Local Development with Vercel KV

For local development with Vercel KV:

1. Install the Vercel CLI: `npm i -g vercel`
2. Log in to your Vercel account: `vercel login`
3. Link your project: `vercel link`
4. Pull environment variables: `vercel env pull .env`
5. Run the development server with `npm run dev`

## Troubleshooting

If you experience issues with the API:

1. Check the Vercel logs in your project dashboard
2. Make sure your KV database is properly connected
3. Check that the environment variables are correctly set in Vercel
4. During local development, make sure you have pulled the environment variables correctly 