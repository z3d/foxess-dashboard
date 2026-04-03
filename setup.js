#!/usr/bin/env node

var readline = require('readline');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function print(msg) {
  console.log(msg || '');
}

function ask(question) {
  return new Promise(function (resolve) {
    rl.question(question, function (answer) {
      resolve(answer.trim());
    });
  });
}

function exec(cmd, opts) {
  return childProcess.execSync(cmd, Object.assign({ stdio: 'inherit' }, opts || {}));
}

function execQuiet(cmd) {
  try {
    return childProcess.execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (e) {
    return null;
  }
}

async function ensureDependencies() {
  var wranglerPath = path.join(__dirname, 'node_modules', '.bin', 'wrangler');
  if (!fs.existsSync(wranglerPath)) {
    print('  Installing dependencies (wrangler)...');
    exec('npm install');
    print('');
  }
}

async function checkCloudflareLogin() {
  var result = execQuiet('npx wrangler whoami');
  if (!result || result.indexOf('Not logged in') !== -1 || result.indexOf('not authenticated') !== -1) {
    return false;
  }
  return true;
}

async function collectCredentials() {
  var config = {};

  print('  Step 1 of 3: FoxESS Cloud Credentials');
  print('  --------------------------------------');
  print('  Find these at: foxesscloud.com -> User Profile -> API Management');
  print('');

  while (!config.foxessApiKey) {
    config.foxessApiKey = await ask('  FoxESS API Key: ');
    if (!config.foxessApiKey) print('  (required)');
  }

  print('');
  print('  Find your serial number in: foxesscloud.com -> Device List');
  print('');

  while (!config.foxessDeviceSn) {
    config.foxessDeviceSn = await ask('  FoxESS Device Serial Number: ');
    if (!config.foxessDeviceSn) print('  (required)');
  }

  print('');
  print('  Step 2 of 3: Dashboard Security');
  print('  --------------------------------');
  print('  The dashboard API key protects your endpoints from unauthorized access.');
  print('');

  var apiKeyChoice = await ask('  Auto-generate a secure API key? (Y/n): ');
  if (apiKeyChoice.toLowerCase() === 'n') {
    while (!config.apiKey) {
      config.apiKey = await ask('  Dashboard API Key: ');
      if (!config.apiKey) print('  (required)');
    }
  } else {
    config.apiKey = crypto.randomBytes(24).toString('hex');
    print('  Generated: ' + config.apiKey);
  }

  print('');
  print('  Step 3 of 3: Optional Settings');
  print('  -------------------------------');
  print('');

  var origin = await ask('  Allowed CORS origin (default: *): ');
  config.allowedOrigin = origin || '*';

  var ttl = await ask('  Cache TTL in seconds (default: 60): ');
  config.cacheTtl = ttl || '60';

  return config;
}

function writeDevVars(config) {
  var content = [
    'FOXESS_API_KEY=' + config.foxessApiKey,
    'FOXESS_DEVICE_SN=' + config.foxessDeviceSn,
    'API_KEY=' + config.apiKey,
    'ALLOWED_ORIGIN=' + config.allowedOrigin,
    'CACHE_TTL=' + config.cacheTtl,
    ''
  ].join('\n');

  fs.writeFileSync(path.join(__dirname, '.dev.vars'), content);
}

async function deploy(config) {
  print('');
  print('  Deploying to Cloudflare...');
  print('  --------------------------');
  print('');

  var loggedIn = await checkCloudflareLogin();
  if (!loggedIn) {
    print('  You need to log in to Cloudflare first.');
    print('');
    exec('npx wrangler login');
    print('');
  }

  print('  Deploying worker...');
  print('');
  exec('npx wrangler deploy');
  print('');

  print('  Setting secrets...');
  print('');

  var secrets = {
    FOXESS_API_KEY: config.foxessApiKey,
    FOXESS_DEVICE_SN: config.foxessDeviceSn,
    API_KEY: config.apiKey,
    ALLOWED_ORIGIN: config.allowedOrigin,
    CACHE_TTL: config.cacheTtl
  };

  var names = Object.keys(secrets);
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    try {
      childProcess.execSync('npx wrangler secret put ' + name, {
        input: secrets[name],
        stdio: ['pipe', 'pipe', 'pipe']
      });
      print('  ✓ ' + name);
    } catch (e) {
      print('  ✗ ' + name + ' - failed: ' + (e.message || 'unknown error'));
    }
  }
}

async function main() {
  print('');
  print('  ╔══════════════════════════════════════════╗');
  print('  ║     FoxESS Dashboard — Setup Wizard      ║');
  print('  ╚══════════════════════════════════════════╝');
  print('');
  print('  This will configure your FoxESS Battery Monitor Dashboard.');
  print('  You\'ll need your FoxESS Cloud API key and device serial number.');
  print('');

  await ensureDependencies();

  var config = await collectCredentials();

  print('');
  print('  Writing .dev.vars for local development...');
  writeDevVars(config);
  print('  ✓ .dev.vars saved');

  print('');
  var deployChoice = await ask('  Deploy to Cloudflare now? (Y/n): ');

  if (deployChoice.toLowerCase() !== 'n') {
    await deploy(config);
  }

  print('');
  print('  ╔══════════════════════════════════════════╗');
  print('  ║            Setup Complete!                ║');
  print('  ╚══════════════════════════════════════════╝');
  print('');
  print('  Your dashboard API key (save this for the Settings page):');
  print('  ' + config.apiKey);
  print('');
  print('  Next steps:');

  if (deployChoice.toLowerCase() === 'n') {
    print('    npm run dev       Start local dev server');
    print('    npm run deploy    Deploy to Cloudflare');
  } else {
    print('    npm run dev       Start local dev server');
    print('    Open the dashboard URL above, go to Settings, and enter your API key');
  }

  print('');
  rl.close();
}

main().catch(function (err) {
  console.error('Setup failed:', err.message);
  rl.close();
  process.exit(1);
});
