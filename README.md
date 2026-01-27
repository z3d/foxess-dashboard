# FoxESS Battery Monitor Dashboard

A simple, iOS 12-compatible dashboard for monitoring your FoxESS hybrid inverter and battery system.

## Features

- Real-time battery state of charge (SOC) with visual indicator
- Charging/discharging/idle status with power display
- Solar generation power
- Home load consumption
- Grid import/export
- Daily energy totals
- Dark theme optimized for always-on displays
- "Add to Home Screen" support for iPad/iPhone
- Configurable refresh interval

## Prerequisites

- FoxESS Cloud account with API access
- Cloudflare account (free tier works)
- A web server to host the HTML file (or use Cloudflare Pages)

## Setup Instructions

### 1. Get Your FoxESS API Key

1. Log in to [FoxESS Cloud](https://www.foxesscloud.com)
2. Go to **User Profile** → **API Management**
3. Click **Generate API Key**
4. Copy and save your API key securely
5. Note your inverter's **Serial Number** (found in Device List)

### 2. Deploy the Cloudflare Worker

#### Option A: Wrangler CLI (Recommended)

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create a new worker project:
   ```bash
   mkdir foxess-worker && cd foxess-worker
   wrangler init
   ```

4. Copy `foxess-worker.js` content to `src/index.js`

5. Create `wrangler.toml`:
   ```toml
   name = "foxess-api"
   main = "src/index.js"
   compatibility_date = "2024-01-01"

   [vars]
   ALLOWED_ORIGIN = "*"
   ```

6. Set secrets:
   ```bash
   wrangler secret put FOXESS_API_KEY
   wrangler secret put FOXESS_DEVICE_SN
   ```

7. Deploy:
   ```bash
   wrangler deploy
   ```

8. Note your worker URL: `https://foxess-api.<your-subdomain>.workers.dev`

#### Option B: Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create Application** → **Create Worker**
3. Name your worker (e.g., `foxess-api`)
4. Click **Deploy**
5. Click **Edit Code** and paste the contents of `foxess-worker.js`
6. Click **Save and Deploy**
7. Go to **Settings** → **Variables**
8. Add environment variables:
   - `FOXESS_API_KEY`: Your FoxESS API key
   - `FOXESS_DEVICE_SN`: Your inverter serial number
   - `ALLOWED_ORIGIN`: `*` (or your dashboard URL for security)
9. Click **Encrypt** for `FOXESS_API_KEY` to protect it
10. Note your worker URL from the dashboard

### 3. Host the Dashboard

#### Option A: Cloudflare Pages (Recommended)

1. Go to **Workers & Pages** → **Create Application** → **Pages**
2. Choose **Direct Upload**
3. Upload `foxess-dashboard.html` (rename to `index.html`)
4. Deploy and note your Pages URL

#### Option B: Any Web Server

Upload `foxess-dashboard.html` to any web hosting service:
- GitHub Pages
- Netlify
- Your own web server
- Local file (file:// works for testing)

#### Option C: Local Testing

Simply open `foxess-dashboard.html` in a browser. Note: Some features may be limited due to CORS when using file:// protocol.

### 4. Configure the Dashboard

1. Open your hosted dashboard URL
2. Click **Settings**
3. Enter your Worker URL (e.g., `https://foxess-api.your-subdomain.workers.dev`)
4. Set your preferred refresh interval (default: 30 seconds)
5. Click **Save Settings**

### 5. Add to iPad Home Screen

1. Open Safari on your iPad
2. Navigate to your dashboard URL
3. Tap the **Share** button (square with arrow)
4. Scroll down and tap **Add to Home Screen**
5. Name it "FoxESS" and tap **Add**
6. Open from your home screen for a full-screen experience

## API Endpoints

The worker exposes these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/realtime` | POST | Real-time inverter data |
| `/api/report?type=day` | POST | Daily energy report |

## Troubleshooting

### "Connection failed" error
- Verify your Worker URL is correct
- Check that the worker is deployed and running
- Ensure CORS is properly configured (`ALLOWED_ORIGIN`)

### "API Error" message
- Verify your `FOXESS_API_KEY` is correct
- Verify your `FOXESS_DEVICE_SN` is correct
- Check that your FoxESS account has API access enabled

### Data not updating
- Check if your inverter is online in FoxESS Cloud
- FoxESS data updates approximately every 5 minutes
- Try clicking the Refresh button

### iOS 12 Safari issues
- The dashboard is designed for iOS 12 compatibility
- Clear Safari cache if you see display issues
- Ensure JavaScript is enabled in Safari settings

## FoxESS API Reference

For more details on the FoxESS API, see the official documentation:
https://www.foxesscloud.com/public/i18n/en/OpenApiDocument.html

## Security Notes

- Store your API key as an encrypted secret in Cloudflare
- Consider setting `ALLOWED_ORIGIN` to your specific dashboard URL
- The worker acts as a proxy, keeping your API key server-side
- Never expose your API key in client-side code

## License

MIT License - Feel free to modify and use as needed.
