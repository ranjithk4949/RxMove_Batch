# RxMove Batch Jobs System

A Node.js application for generating automated daily and monthly reports for RxMove pharmacy delivery platform.

## Features

### Daily Reports
- **Automated Daily Reports**: Generates PDF reports for each pharmacy
- **Delivery Summary**: Total orders, delivered count, revenue breakdown
- **Customer Details**: Patient information and delivery addresses
- **Collection Tracking**: Amounts to collect vs. amounts collected
- **Professional PDF**: Clean, branded PDF reports
- **Email Delivery**: Automatic email delivery to pharmacy contacts

### Monthly Reports
- **Monthly Billing**: Comprehensive monthly statements
- **App Usage Fee**: Automatic $75 monthly app usage fee
- **Delivery Revenue**: Total delivery costs for the month
- **Collection Summary**: Customer payment tracking
- **Invoice Generation**: Professional invoice-style reports
- **Payment Tracking**: Integration ready for payment processing

## Tech Stack

- **Runtime**: Node.js 18+
- **Database**: Supabase (PostgreSQL)
- **PDF Generation**: Puppeteer (HTML to PDF)
- **Email**: Nodemailer (SMTP)
- **Scheduling**: node-cron
- **Logging**: Winston
- **Templates**: Handlebars

## Installation

1. **Clone the repository**:
```bash
git clone <your-batch-jobs-repo-url>
cd rxmove-batch-jobs
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

4. **Test the setup**:
```bash
npm run test
```

## Configuration

### Email Setup (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### Supabase Setup

1. **Get Service Role Key**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (not the `anon` key)
   - This key has full database access for batch operations

2. **Database Access**:
   - The application connects to your existing RxMove database
   - Uses the same tables: `users`, `orders`, `client_registrations`

## Usage

### Manual Execution

```bash
# Generate daily reports for yesterday
npm run daily-reports

# Generate monthly reports for last month
npm run monthly-reports

# Test report generation
npm run test
```

### Automated Scheduling

```bash
# Start the scheduler (runs continuously)
npm start
```

**Default Schedule**:
- **Daily Reports**: Every day at 9:00 AM EST
- **Monthly Reports**: 1st day of each month at 10:00 AM EST

## Report Details

### Daily Report Contents

1. **Header Section**
   - RxMove branding and logo
   - Pharmacy name and contact info
   - Report date and period

2. **Executive Summary**
   - Total orders for the day
   - Successful deliveries count
   - Total delivery revenue
   - Collection summary

3. **Order Details Table**
   - Order ID and timestamp
   - Customer name and contact
   - Delivery address
   - Delivery cost and distance
   - Collection amounts
   - Order status

4. **Financial Summary**
   - Total delivery fees earned
   - Customer payments to collect
   - Customer payments collected
   - Outstanding amounts

### Monthly Report Contents

1. **Invoice Header**
   - Professional invoice layout
   - Pharmacy billing information
   - Invoice number and date
   - Payment terms

2. **Service Summary**
   - Monthly app usage fee: $75.00
   - Total delivery orders processed
   - Total delivery revenue
   - Service period details

3. **Delivery Breakdown**
   - Daily delivery counts
   - Revenue by day
   - Peak delivery days
   - Performance metrics

4. **Payment Summary**
   - App usage fee: $75.00
   - Delivery fees: $X.XX
   - **Total Amount Due**: $75.00 + delivery fees
   - Payment instructions

## File Structure

```
src/
├── config/
│   ├── database.js          # Supabase configuration
│   ├── email.js             # Email service setup
│   └── logger.js            # Winston logging setup
├── jobs/
│   ├── dailyReports.js      # Daily report generation
│   ├── monthlyReports.js    # Monthly report generation
│   └── scheduler.js         # Cron job scheduler
├── services/
│   ├── reportService.js     # Report generation logic
│   ├── emailService.js      # Email sending service
│   ├── pdfService.js        # PDF generation service
│   └── dataService.js       # Database queries
├── templates/
│   ├── daily-report.hbs     # Daily report HTML template
│   ├── monthly-report.hbs   # Monthly report HTML template
│   └── email-templates/     # Email HTML templates
├── utils/
│   ├── dateUtils.js         # Date/timezone utilities
│   ├── formatters.js        # Currency and data formatters
│   └── validators.js        # Data validation
├── test/
│   └── testReports.js       # Test report generation
└── index.js                 # Main application entry
```

## Deployment Options

### 1. VPS/Server Deployment
```bash
# Install PM2 for process management
npm install -g pm2

# Start the application
pm2 start src/index.js --name "rxmove-batch-jobs"

# Set up PM2 to start on boot
pm2 startup
pm2 save
```

### 2. Docker Deployment
```bash
# Build Docker image
docker build -t rxmove-batch-jobs .

# Run container
docker run -d --name rxmove-batch-jobs \
  --env-file .env \
  rxmove-batch-jobs
```

### 3. Cloud Functions
- Can be adapted for AWS Lambda, Google Cloud Functions, or Vercel
- Trigger via HTTP endpoints or scheduled events

## Monitoring

### Logs
```bash
# View application logs
tail -f logs/application.log

# View error logs
tail -f logs/error.log
```

### Health Checks
- Application includes health check endpoints
- Monitor database connectivity
- Track email delivery success rates
- Log report generation statistics

## Customization

### Report Templates
- Modify `src/templates/` files to customize report layout
- Use Handlebars syntax for dynamic content
- Add company branding and styling

### Scheduling
- Edit `src/jobs/scheduler.js` to change report timing
- Add new scheduled jobs as needed
- Configure timezone-specific scheduling

### Email Templates
- Customize email content in `src/templates/email-templates/`
- Add HTML styling and branding
- Include dynamic content and attachments

## Security

- **Service Role Key**: Secure storage of Supabase credentials
- **Email Credentials**: App passwords for email authentication
- **Data Access**: Read-only access to pharmacy data
- **Audit Trail**: Complete logging of all operations

## Support

For questions or issues:
- **Email**: rxmove.contact@gmail.com
- **Phone**: 902-403-9507
- **Documentation**: See individual service files for detailed API docs

## License

MIT License - See LICENSE file for details
