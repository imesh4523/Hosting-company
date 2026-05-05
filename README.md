# youuhost VPS Reseller Platform

A production-ready VPS Reseller platform built with Next.js 14, Node.js, and DigitalOcean API.

## 🚀 Key Features

- **Multi-Account DO Management**: Load balance VPS creation across multiple DigitalOcean accounts.
- **Premium UI/UX**: youuhost-inspired design with dark/light modes and glassmorphism.
- **Automated Failover**: Heartbeat monitor that auto-replaces failed VPS instances.
- **Fraud Detection**: Score-based system using IPQualityScore and FingerprintJS.
- **Real-time Metrics**: Live CPU, RAM, and Disk usage monitoring.
- **Auto-Deployment**: GitHub Actions CI/CD with Docker support.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, TypeScript, Express, Prisma
- **Database**: PostgreSQL, Redis
- **Infrastructure**: DigitalOcean API, Backblaze B2

## 📦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd hosting-site
   ```

2. **Run the setup script**:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Configure Environment Variables**:
   Update `backend/.env` with your API keys (DigitalOcean, Stripe, IPQualityScore).

4. **Production Deployment**:
   ```bash
   docker-compose up -d --build
   ```

## 🔐 Security

- API keys are encrypted at rest using AES-256.
- JWT-based authentication with 2FA support.
- Rate limiting and SQL injection protection included.

## 📄 License

MIT License.
