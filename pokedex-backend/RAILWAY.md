Railway Deployment

1. Setup Railway:
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

2. Deploy from GitHub (Recommended):
1. Push your code to GitHub
2. Go to https://railway.app
3. Click "Deploy from GitHub repo"
4. Select your repo
5. Railway auto-detects the Dockerfile

3. Or deploy from CLI:
# In your project directory
railway login
railway new
railway link
railway up

4. Set Environment Variables:
In Railway dashboard, go to Variables tab and add:
DATABASE_URL=your_supabase_url
DIRECT_URL=your_supabase_direct_url

5. Custom Domain (Optional):
- Railway provides a .railway.app domain automatically
- Add custom domain in Settings > Domains

Railway Benefits:

- Automatic HTTPS
- Auto-deploys on git push
- Built-in monitoring
- Easy scaling
- Free tier available

Your API will be live at https://your-project.railway.app once deployed. The Dockerfile will handle everything - Bun runtime,
dependencies, and Prisma client generation