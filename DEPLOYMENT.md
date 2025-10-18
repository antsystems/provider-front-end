# Deployment Guide for Google Cloud Run

This guide will help you deploy your Next.js application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Create one at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud Project**: Create a new project or use an existing one
3. **gcloud CLI**: Install from [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install)
4. **Docker**: Install from [docs.docker.com](https://docs.docker.com/get-docker/)

## Initial Setup

### 1. Install and Configure gcloud CLI

```bash
# Install gcloud CLI (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Initialize gcloud and authenticate
gcloud init

# Authenticate with your Google account
gcloud auth login

# Set your project ID
export GCP_PROJECT_ID="your-project-id"
gcloud config set project $GCP_PROJECT_ID
```

### 2. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Configure Docker Authentication

```bash
gcloud auth configure-docker
```

## Deployment Methods

### Method 1: Manual Deployment Using Script (Recommended for Quick Deploys)

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# Optional: Set your preferred region
export GCP_REGION="us-central1"

# Run the deployment script
./deploy.sh
```

### Method 2: Manual Step-by-Step Deployment

```bash
# 1. Set variables
export PROJECT_ID="your-project-id"
export SERVICE_NAME="provider-app"
export REGION="us-central1"

# 2. Build the Docker image
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

# 3. Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# 4. Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 3000
```

### Method 3: Automated CI/CD with Cloud Build

This method automatically deploys when you push to your git repository.

#### Set up Cloud Build Trigger:

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Create Trigger"
3. Connect your repository (GitHub, Bitbucket, or Cloud Source Repositories)
4. Configure the trigger:
   - **Name**: `deploy-provider-app`
   - **Event**: Push to a branch
   - **Branch**: `^main$` (or your preferred branch)
   - **Configuration**: Cloud Build configuration file
   - **Location**: `cloudbuild.yaml`
5. Click "Create"

Now, every push to the main branch will automatically build and deploy your application.

#### Manual Cloud Build Deployment:

```bash
gcloud builds submit --config cloudbuild.yaml
```

## Environment Variables and Secrets

### Using Environment Variables

Add environment variables during deployment:

```bash
gcloud run deploy provider-app \
  --image gcr.io/$PROJECT_ID/provider-app:latest \
  --platform managed \
  --region $REGION \
  --set-env-vars NODE_ENV=production,NEXT_PUBLIC_API_URL=https://api.example.com
```

### Using Secret Manager (Recommended for Sensitive Data)

1. **Create secrets in Secret Manager:**

```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create a secret (e.g., for Firebase API key)
echo -n "your-firebase-api-key" | gcloud secrets create firebase-api-key --data-file=-

# Grant Cloud Run access to the secret
gcloud secrets add-iam-policy-binding firebase-api-key \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

2. **Deploy with secrets:**

```bash
gcloud run deploy provider-app \
  --image gcr.io/$PROJECT_ID/provider-app:latest \
  --platform managed \
  --region $REGION \
  --set-secrets FIREBASE_API_KEY=firebase-api-key:latest
```

## Configuration Options

### Scaling Configuration

```bash
# Adjust based on your traffic needs
--min-instances 0      # Scale to zero when idle (cost-effective)
--max-instances 10     # Maximum concurrent instances
--concurrency 80       # Requests per instance
```

### Resource Allocation

```bash
# Adjust based on your application needs
--memory 512Mi    # Options: 128Mi, 256Mi, 512Mi, 1Gi, 2Gi, 4Gi, 8Gi
--cpu 1           # Options: 1, 2, 4, 6, 8
--timeout 300     # Request timeout in seconds (max 3600)
```

### Access Control

```bash
# Public access (no authentication required)
--allow-unauthenticated

# Or require authentication
--no-allow-unauthenticated
```

## Custom Domain Setup

1. **Verify domain ownership** in [Google Search Console](https://search.google.com/search-console)

2. **Map your domain to Cloud Run:**

```bash
gcloud run domain-mappings create \
  --service provider-app \
  --domain your-domain.com \
  --region $REGION
```

3. **Update DNS records** as shown in the Cloud Run console

## Monitoring and Logging

### View Logs

```bash
# Stream logs in real-time
gcloud run services logs tail provider-app --region $REGION

# View logs in Cloud Console
# Visit: https://console.cloud.google.com/logs
```

### Monitor Performance

- Visit [Cloud Run Console](https://console.cloud.google.com/run)
- Click on your service to view metrics:
  - Request count
  - Request latency
  - Container instances
  - CPU and memory utilization

## Troubleshooting

### Build Fails

1. Check Docker build locally:
   ```bash
   docker build -t test-build .
   docker run -p 3000:3000 test-build
   ```

2. Review Cloud Build logs:
   ```bash
   gcloud builds list
   gcloud builds log <BUILD_ID>
   ```

### Deployment Fails

1. Check service logs:
   ```bash
   gcloud run services logs read provider-app --region $REGION
   ```

2. Verify service configuration:
   ```bash
   gcloud run services describe provider-app --region $REGION
   ```

### Application Errors

1. Check application logs in Cloud Console
2. Verify environment variables are set correctly
3. Ensure all required secrets are accessible
4. Test locally with Docker:
   ```bash
   docker run -p 3000:3000 -e NODE_ENV=production gcr.io/$PROJECT_ID/provider-app:latest
   ```

## Cost Optimization

1. **Use minimum instances = 0** to scale to zero when idle
2. **Set appropriate memory/CPU** limits (start small and scale up if needed)
3. **Enable request timeout** to prevent long-running requests
4. **Use Cloud CDN** for static assets
5. **Monitor usage** regularly in the Cloud Console billing section

## Useful Commands

```bash
# List all Cloud Run services
gcloud run services list

# Get service URL
gcloud run services describe provider-app --region $REGION --format 'value(status.url)'

# Update service configuration
gcloud run services update provider-app --region $REGION --memory 1Gi

# Delete service
gcloud run services delete provider-app --region $REGION

# Rollback to previous revision
gcloud run services update-traffic provider-app --to-revisions=PREVIOUS_REVISION=100 --region $REGION
```

## Next Steps

1. Set up environment variables for production
2. Configure Firebase or other backend services
3. Set up custom domain
4. Configure Cloud CDN for better performance
5. Set up monitoring and alerting
6. Implement CI/CD with Cloud Build triggers

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
