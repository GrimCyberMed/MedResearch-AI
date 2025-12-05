# 🚀 Deployment Guide - MedResearch AI v5.1.0

**Version**: 5.1.0  
**Last Updated**: December 5, 2025  
**Deployment Type**: Local, Cloud, Docker  
**Status**: Production-Ready

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Deployment](#local-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Configuration](#configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring](#monitoring)
9. [Backup & Recovery](#backup--recovery)
10. [Security](#security)

---

## 🔧 Prerequisites

### **System Requirements**

#### **Minimum Requirements**
- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 10 GB free space
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

#### **Recommended Requirements**
- **OS**: Windows 11, macOS 13+, Linux (Ubuntu 22.04+)
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 20+ GB SSD
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher

### **Software Dependencies**

```bash
# Check Node.js version
node --version  # Should be >= v18.0.0

# Check npm version
npm --version   # Should be >= v9.0.0

# Check Git version
git --version   # Any recent version
```

### **Optional Dependencies**

- **R** (v4.0+) - For statistical analysis tools
- **Docker** (v20.0+) - For containerized deployment
- **PostgreSQL** (v13+) - For production database (optional)
- **Redis** (v6.0+) - For caching (optional)

---

## 💻 Local Deployment

### **Step 1: Clone Repository**

```bash
# Clone from GitHub
git clone https://github.com/GrimCyberMed/MedResearch-AI.git

# Navigate to project directory
cd MedResearch-AI
```

### **Step 2: Install Dependencies**

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### **Step 3: Configure Environment**

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
# Required: API keys for PubMed, Semantic Scholar, etc.
```

**Example `.env` file:**
```env
# API Keys
PUBMED_API_KEY=your_pubmed_api_key
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_api_key
LENS_API_KEY=your_lens_api_key
UNPAYWALL_EMAIL=your_email@example.com

# Database
DATABASE_PATH=./.memory/project-memory.db

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/medresearch-ai.log

# Cache
CACHE_TTL=3600
CACHE_MAX_SIZE=100

# Server
PORT=3000
HOST=localhost
```

### **Step 4: Build Project**

```bash
# Compile TypeScript
npm run build

# Verify build
ls -la dist/
```

### **Step 5: Run Tests**

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:databases
npm run test:plagiarism
```

### **Step 6: Start Server**

```bash
# Start MCP server
node dist/mcp/index.js

# Or use npm script
npm start
```

### **Step 7: Verify Deployment**

```bash
# Check server is running
curl http://localhost:3000/health

# Test a tool
# (Use MCP client to call tools)
```

---

## 🐳 Docker Deployment

### **Step 1: Create Dockerfile**

Create `Dockerfile` in project root:

```dockerfile
# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/mcp/index.js"]
```

### **Step 2: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  medresearch-ai:
    build: .
    container_name: medresearch-ai
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PUBMED_API_KEY=${PUBMED_API_KEY}
      - SEMANTIC_SCHOLAR_API_KEY=${SEMANTIC_SCHOLAR_API_KEY}
      - LENS_API_KEY=${LENS_API_KEY}
      - UNPAYWALL_EMAIL=${UNPAYWALL_EMAIL}
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./.memory:/app/.memory
    restart: unless-stopped
    networks:
      - medresearch-network

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    container_name: medresearch-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - medresearch-network

networks:
  medresearch-network:
    driver: bridge

volumes:
  redis-data:
```

### **Step 3: Build and Run**

```bash
# Build Docker image
docker build -t medresearch-ai:5.1.0 .

# Run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f medresearch-ai

# Stop containers
docker-compose down
```

### **Step 4: Verify Docker Deployment**

```bash
# Check container status
docker ps

# Check health
docker exec medresearch-ai node -e "console.log('OK')"

# View logs
docker logs medresearch-ai
```

---

## ☁️ Cloud Deployment

### **AWS Deployment**

#### **Option 1: AWS EC2**

```bash
# 1. Launch EC2 instance (Ubuntu 22.04, t3.medium)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone and deploy
git clone https://github.com/GrimCyberMed/MedResearch-AI.git
cd MedResearch-AI
npm install
npm run build
npm start

# 5. Setup PM2 for process management
sudo npm install -g pm2
pm2 start dist/mcp/index.js --name medresearch-ai
pm2 save
pm2 startup
```

#### **Option 2: AWS ECS (Docker)**

```bash
# 1. Build and push to ECR
aws ecr create-repository --repository-name medresearch-ai
docker build -t medresearch-ai:5.1.0 .
docker tag medresearch-ai:5.1.0 your-account.dkr.ecr.region.amazonaws.com/medresearch-ai:5.1.0
docker push your-account.dkr.ecr.region.amazonaws.com/medresearch-ai:5.1.0

# 2. Create ECS task definition
# 3. Create ECS service
# 4. Configure load balancer
```

#### **Option 3: AWS Lambda (Serverless)**

```bash
# Package for Lambda
npm install
npm run build
zip -r medresearch-ai.zip dist/ node_modules/ package.json

# Deploy to Lambda
aws lambda create-function \
  --function-name medresearch-ai \
  --runtime nodejs20.x \
  --handler dist/mcp/index.handler \
  --zip-file fileb://medresearch-ai.zip \
  --role arn:aws:iam::account:role/lambda-role
```

### **Azure Deployment**

```bash
# 1. Create Azure App Service
az webapp create \
  --resource-group medresearch-rg \
  --plan medresearch-plan \
  --name medresearch-ai \
  --runtime "NODE|20-lts"

# 2. Deploy code
az webapp deployment source config-zip \
  --resource-group medresearch-rg \
  --name medresearch-ai \
  --src medresearch-ai.zip
```

### **Google Cloud Deployment**

```bash
# 1. Build and push to GCR
gcloud builds submit --tag gcr.io/project-id/medresearch-ai:5.1.0

# 2. Deploy to Cloud Run
gcloud run deploy medresearch-ai \
  --image gcr.io/project-id/medresearch-ai:5.1.0 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## ⚙️ Configuration

### **Environment Variables**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PUBMED_API_KEY` | Yes | - | PubMed API key |
| `SEMANTIC_SCHOLAR_API_KEY` | Yes | - | Semantic Scholar API key |
| `LENS_API_KEY` | Yes | - | The Lens API key |
| `UNPAYWALL_EMAIL` | Yes | - | Email for Unpaywall API |
| `DATABASE_PATH` | No | `./.memory/project-memory.db` | SQLite database path |
| `LOG_LEVEL` | No | `info` | Logging level (debug, info, warn, error) |
| `LOG_FILE` | No | `./logs/medresearch-ai.log` | Log file path |
| `CACHE_TTL` | No | `3600` | Cache TTL in seconds |
| `CACHE_MAX_SIZE` | No | `100` | Max cache entries |
| `PORT` | No | `3000` | Server port |
| `HOST` | No | `localhost` | Server host |
| `NODE_ENV` | No | `development` | Environment (development, production) |

### **Configuration Files**

#### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### **package.json Scripts**
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/mcp/index.js",
    "test": "node --test",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"**/*.{ts,json,md}\""
  }
}
```

---

## ✅ Verification

### **Health Checks**

```bash
# 1. Check server is running
curl http://localhost:3000/health
# Expected: {"status": "ok", "version": "5.1.0"}

# 2. Check database connection
# (Tool-specific verification)

# 3. Check API connectivity
# Test PubMed search
# Test Semantic Scholar search
```

### **Smoke Tests**

```bash
# Run smoke tests
npm run test:smoke

# Test each tool category
npm run test:databases
npm run test:statistics
npm run test:plagiarism
```

### **Performance Tests**

```bash
# Run performance benchmarks
npm run test:performance

# Check response times
# Verify all tools meet performance targets
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **Issue: Build Fails**
```bash
# Solution: Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### **Issue: Port Already in Use**
```bash
# Solution: Change port or kill process
# Change port in .env
PORT=3001

# Or kill process using port
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

#### **Issue: API Key Errors**
```bash
# Solution: Verify API keys in .env
cat .env | grep API_KEY

# Test API keys individually
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=cancer&api_key=YOUR_KEY"
```

#### **Issue: Database Locked**
```bash
# Solution: Close other connections
# Check for other processes using database
lsof .memory/project-memory.db

# Restart server
pm2 restart medresearch-ai
```

#### **Issue: Memory Errors**
```bash
# Solution: Increase Node.js memory
node --max-old-space-size=4096 dist/mcp/index.js

# Or in package.json
"start": "node --max-old-space-size=4096 dist/mcp/index.js"
```

### **Debug Mode**

```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# View detailed logs
tail -f logs/medresearch-ai.log

# Node.js debugging
node --inspect dist/mcp/index.js
```

---

## 📊 Monitoring

### **Logging**

```bash
# View logs
tail -f logs/medresearch-ai.log

# Search logs
grep "ERROR" logs/medresearch-ai.log

# Log rotation (using logrotate)
sudo logrotate -f /etc/logrotate.d/medresearch-ai
```

### **Metrics**

```javascript
// Custom metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    toolUsage: getToolUsageStats()
  });
});
```

### **Alerts**

```bash
# Setup alerts for:
# - High error rate
# - Slow response times
# - High memory usage
# - API failures
```

---

## 💾 Backup & Recovery

### **Backup Strategy**

```bash
# Backup database
cp .memory/project-memory.db backups/project-memory-$(date +%Y%m%d).db

# Backup configuration
tar -czf backups/config-$(date +%Y%m%d).tar.gz .env tsconfig.json package.json

# Automated backup script
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
cp .memory/project-memory.db $BACKUP_DIR/
cp .env $BACKUP_DIR/
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR
```

### **Recovery Procedure**

```bash
# 1. Stop server
pm2 stop medresearch-ai

# 2. Restore database
cp backups/project-memory-20251205.db .memory/project-memory.db

# 3. Restore configuration
cp backups/.env.backup .env

# 4. Restart server
pm2 start medresearch-ai

# 5. Verify
curl http://localhost:3000/health
```

---

## 🔒 Security

### **Security Checklist**

- [ ] Use HTTPS in production
- [ ] Secure API keys (use secrets manager)
- [ ] Enable rate limiting
- [ ] Implement authentication
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly
- [ ] Implement input validation
- [ ] Use security headers

### **SSL/TLS Configuration**

```bash
# Generate SSL certificate (Let's Encrypt)
sudo certbot certonly --standalone -d your-domain.com

# Configure HTTPS
# Add to server configuration
```

### **API Key Management**

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name medresearch-ai/api-keys \
  --secret-string '{"PUBMED_API_KEY":"xxx","SEMANTIC_SCHOLAR_API_KEY":"yyy"}'

# Retrieve in application
const secrets = await secretsManager.getSecretValue({SecretId: 'medresearch-ai/api-keys'}).promise();
```

### **Rate Limiting**

```javascript
// Implement rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📚 Additional Resources

- [Installation Guide](../README.md#installation)
- [Maintenance Plan](./MAINTENANCE-PLAN.md)
- [API Documentation](./API-DOCUMENTATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Security Policy](../SECURITY.md)

---

## 🆘 Support

### **Getting Help**

1. **Documentation**: Check this guide and README
2. **GitHub Issues**: Report bugs or request features
3. **GitHub Discussions**: Ask questions
4. **Email**: Contact maintainers (if applicable)

### **Reporting Issues**

When reporting deployment issues, include:
- OS and version
- Node.js version
- npm version
- Error messages
- Deployment method (local, Docker, cloud)
- Steps to reproduce

---

## ✅ Deployment Checklist

### **Pre-Deployment**
- [ ] Review system requirements
- [ ] Obtain API keys
- [ ] Configure environment variables
- [ ] Run tests locally
- [ ] Review security settings

### **Deployment**
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Build project
- [ ] Configure environment
- [ ] Start server
- [ ] Verify health checks

### **Post-Deployment**
- [ ] Monitor logs
- [ ] Check performance metrics
- [ ] Setup backups
- [ ] Configure monitoring
- [ ] Document deployment
- [ ] Train users

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Next Review**: January 5, 2026  
**Status**: Production-Ready
