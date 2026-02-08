# FoxESS Battery Monitor Dashboard

A simple, iOS 12-compatible dashboard for monitoring your FoxESS hybrid inverter and battery system. Deploys as a single Cloudflare Worker that serves both the dashboard UI and API.

## Features

- Real-time battery state of charge (SOC) with visual indicator
- Charging/discharging/idle status with power display
- Time to full charge / time to reserve estimates with expected completion time
- Configurable battery size and reserve percentage
- Battery temperature and grid voltage
- Solar generation power
- Home load consumption
- Grid import/export with configurable free period highlighting (e.g., Globird ZeroHero)
- Weather panel with current conditions emoji, temperature, humidity, dew point comfort indicator, and sunrise/sunset times
- 12-hour (AM/PM) or 24-hour clock format
- Dark theme optimized for always-on displays
- "Add to Home Screen" support for iPad/iPhone
- Automatic reload when new version is deployed
- Configurable refresh interval with countdown timer
- "Last updated" timestamp display on connection errors
- Import/export settings for easy backup and migration
- Edge caching to reduce FoxESS API quota usage

## Project Structure

```
├── wrangler.jsonc          # Worker configuration
├── public/
│   ├── index.html          # Dashboard frontend
│   └── robots.txt
└── src/
    ├── worker.js           # Worker entry point (API routing)
    └── lib/
        └── foxess.js       # Shared helpers (FoxESS API, auth, caching)
```

## Prerequisites

- FoxESS Cloud account with API access
- Cloudflare account (free tier works)

## Setup Instructions

### 1. Get Your FoxESS API Key

1. Log in to [FoxESS Cloud](https://www.foxesscloud.com)
2. Go to **User Profile** → **API Management**
3. Click **Generate API Key**
4. Copy and save your API key securely
5. Note your inverter's **Serial Number** (found in Device List)

### 2. Deploy to Cloudflare

#### Option A: Git Integration (Recommended)

1. Push this repo to GitHub
2. In [Cloudflare Dashboard](https://dash.cloudflare.com), go to **Workers & Pages** → **Create** → **Import a repository**
3. Connect your GitHub repo
4. Set the deploy command to: `npx wrangler deploy`
5. Deploy — pushes to `master` will auto-deploy

#### Option B: Wrangler CLI

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Deploy:
   ```bash
   wrangler deploy
   ```

4. Note your worker URL: `https://<your-worker>.<your-subdomain>.workers.dev`

### 3. Set Environment Variables

In **Cloudflare Dashboard > Workers & Pages > your worker > Settings > Variables and Secrets**, add:

| Variable | Required | Description |
|----------|----------|-------------|
| `FOXESS_API_KEY` | Yes | Your FoxESS Cloud API key (encrypt) |
| `FOXESS_DEVICE_SN` | Yes | Your inverter serial number |
| `API_KEY` | Yes | Secret key for dashboard authentication (encrypt) |
| `ALLOWED_ORIGIN` | No | Allowed CORS origin (default: `*`) |
| `CACHE_TTL` | No | Cache duration in seconds (default: `60`) |

Click **Encrypt** for `FOXESS_API_KEY` and `API_KEY` to protect them.

### 4. Configure the Dashboard

1. Open your worker URL in a browser (e.g., `https://<your-worker>.<your-subdomain>.workers.dev`)
2. Click **Settings**
3. The **Worker URL** defaults to the current origin — no need to change it unless you're hosting the frontend separately
4. Enter your API Key (the same value you set for `API_KEY` above)
5. Set your preferred refresh interval (default: 180 seconds)
6. Optionally update your latitude/longitude for weather data
7. Configure battery settings:
   - **Battery Size**: Your battery capacity in kWh (default: 41)
   - **Battery Reserve**: Minimum charge percentage to maintain (default: 10%)
8. Configure **Free Grid Import Periods** for plans like Globird ZeroHero:
   - Default: 11:00 - 14:00 (11 AM - 2 PM)
   - Add additional periods with "+ Add Period"
   - Grid import shows green during these times
9. Toggle options:
   - **Show Weather Panel**: Display weather information (default: on)
   - **Use 24-hour Clock**: Switch between 12h AM/PM and 24h format (default: 12h)
10. Click **Save Settings**
11. Use **Export Settings** / **Import Settings** to back up or restore your configuration as a JSON file

### 5. Add to iPad Home Screen

1. Open Safari on your iPad
2. Navigate to your dashboard URL
3. Tap the **Share** button (square with arrow)
4. Scroll down and tap **Add to Home Screen**
5. Name it "FoxESS" and tap **Add**
6. Open from your home screen for a full-screen experience

## API Authentication

To prevent inadvertent calls from third parties, the API requires authentication:

1. Set the `API_KEY` environment variable in your Cloudflare Worker (required)
2. Clients must include the `X-API-Key` header with matching value
3. The `/api/health` endpoint is always public (no authentication required)
4. All other endpoints require valid authentication

### Example authenticated request:

```bash
curl -H "X-API-Key: your-secret-key" https://your-worker.workers.dev/api/realtime
```

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/health` | GET | Health check | No |
| `/api/realtime` | GET/POST | Real-time inverter data | Yes |
| `/api/report?type=day` | GET/POST | Daily energy report | Yes |

## Troubleshooting

### "Connection failed" error
- Verify your Worker URL is correct in dashboard settings
- Check that the worker is deployed and running (`/api/health` should return OK)
- Ensure CORS is properly configured (`ALLOWED_ORIGIN`)

### "API Error" message
- Verify your `FOXESS_API_KEY` is correct
- Verify your `FOXESS_DEVICE_SN` is correct
- Check that your FoxESS account has API access enabled

### Data not updating
- Check if your inverter is online in FoxESS Cloud
- FoxESS data updates approximately every 5 minutes
- Try clicking the Refresh button
- Cached responses expire after `CACHE_TTL` seconds (default: 60)

### iOS 12 Safari issues
- The dashboard is designed for iOS 12 compatibility
- Clear Safari cache if you see display issues
- Ensure JavaScript is enabled in Safari settings

## FoxESS API Reference

For more details on the FoxESS API, see the official documentation:
https://www.foxesscloud.com/public/i18n/en/OpenApiDocument.html

## Security Notes

- Store your FoxESS API key as an encrypted secret in Cloudflare
- Set the `API_KEY` environment variable to protect your worker endpoints
- Consider setting `ALLOWED_ORIGIN` to your specific dashboard URL instead of `*`
- The worker acts as a proxy, keeping your FoxESS API key server-side
- Never expose your API keys in client-side code
- For production use, combine `API_KEY` authentication with restricted CORS origins
- Use a strong, unique value for your `API_KEY` (e.g., generate with `openssl rand -hex 32`)

## License

MIT License - Feel free to modify and use as needed.
