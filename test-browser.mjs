import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = '/tmp/kebele-screenshots';

async function waitForServer(url, maxTries = 10) {
  for (let i = 0; i < maxTries; i++) {
    try {
      await new Promise((resolve, reject) => {
        http.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0' } }, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        }).on('error', reject);
      });
      console.log(`Server ready after ${i + 1} tries`);
      return;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Server not ready');
}

async function visitPage(browser, url, name) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const logs = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') {
      errors.push(`[ERROR] ${text}`);
    } else if (type === 'warning') {
      logs.push(`[WARN] ${text}`);
    } else {
      logs.push(`[LOG] ${text}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`[PAGE ERROR] ${err.message}`);
  });

  try {
    const start = Date.now();
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - start;

    // Wait for any late errors
    await page.waitForTimeout(1000);

    const screenshotPath = path.join(OUTPUT_DIR, `${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return {
      name,
      url,
      success: true,
      status: response ? response.status() : 'unknown',
      loadTime,
      finalUrl: page.url(),
      title: await page.title().catch(() => 'no title'),
      errors,
      logs,
      screenshot: screenshotPath,
      contentSnippet: await page.content().then(html => html.substring(0, 500)).catch(() => ''),
    };
  } catch (err) {
    const screenshotPath = path.join(OUTPUT_DIR, `${name}-error.png`);
    try {
      await page.screenshot({ path: screenshotPath, fullPage: false });
    } catch {}
    return {
      name,
      url,
      success: false,
      error: err.message,
      finalUrl: page.url(),
      title: await page.title().catch(() => 'no title'),
      errors,
      logs,
      screenshot: screenshotPath,
    };
  } finally {
    await context.close();
  }
}

(async () => {
  try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    
    console.log('Waiting for dev server...');
    await waitForServer(BASE_URL);

    console.log('Launching Chromium...');
    const browser = await chromium.launch({ headless: true });

    const publicPages = [
      { path: '/', name: 'homepage' },
      { path: '/events', name: 'events' },
      { path: '/souq', name: 'souq' },
      { path: '/radio', name: 'radio' },
      { path: '/media', name: 'media' },
      { path: '/forum', name: 'forum' },
      { path: '/games', name: 'games' },
      { path: '/about', name: 'about' },
    ];

    const adminPages = [
      { path: '/admin', name: 'admin_dashboard' },
      { path: '/admin/events', name: 'admin_events' },
      { path: '/admin/users', name: 'admin_users' },
    ];

    const results = [];

    // Visit public pages
    console.log('\n=== PUBLIC PAGES ===');
    for (const p of publicPages) {
      const fullUrl = BASE_URL + p.path;
      console.log(`Visiting ${fullUrl}...`);
      const result = await visitPage(browser, fullUrl, p.name);
      results.push(result);
      console.log(`  -> ${result.success ? 'OK' : 'FAIL'} (${result.status || result.error}) | Title: "${result.title}" | URL: ${result.finalUrl}`);
      if (result.errors.length > 0) console.log(`  Console errors: ${result.errors.length}`);
    }

    // Visit admin pages
    console.log('\n=== ADMIN PAGES ===');
    for (const p of adminPages) {
      const fullUrl = BASE_URL + p.path;
      console.log(`Visiting ${fullUrl}...`);
      const result = await visitPage(browser, fullUrl, p.name);
      results.push(result);
      console.log(`  -> ${result.success ? 'OK' : 'FAIL'} (${result.status || result.error}) | Title: "${result.title}" | URL: ${result.finalUrl}`);
      if (result.errors.length > 0) console.log(`  Console errors: ${result.errors.length}`);
    }

    await browser.close();

    // Print report
    console.log('\n========================================');
    console.log('  FULL REPORT');
    console.log('========================================');
    
    for (const r of results) {
      console.log(`\n--- ${r.name.toUpperCase()} ---`);
      console.log(`URL: ${r.url}`);
      console.log(`Final URL: ${r.finalUrl}`);
      console.log(`Title: ${r.title}`);
      if (r.success) {
        console.log(`Status: ${r.status} | Load: ${r.loadTime}ms`);
      } else {
        console.log(`ERROR: ${r.error}`);
      }
      if (r.errors.length > 0) {
        console.log(`Console/JS Errors (${r.errors.length}):`);
        r.errors.forEach(e => console.log(`  ${e}`));
      }
      if (r.logs && r.logs.length > 0) {
        console.log(`Console Logs (${r.logs.length}):`);
        r.logs.slice(0, 5).forEach(l => console.log(`  ${l}`));
        if (r.logs.length > 5) console.log(`  ... and ${r.logs.length - 5} more`);
      }
      console.log(`Screenshot: ${r.screenshot}`);
    }

    // Write JSON report
    fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(results, null, 2));
    console.log(`\nReport saved to ${path.join(OUTPUT_DIR, 'report.json')}`);

    process.exit(0);
  } catch (e) {
    console.error('Fatal error:', e.message);
    process.exit(1);
  }
})();
