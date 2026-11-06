import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',workers:1,
 use:{baseURL:'http://127.0.0.1:5173',headless:true,launchOptions:process.platform==='win32'?{executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{}},
 webServer:[{command:'npm run dev -- --strictPort',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:30000},{command:'node scripts/live-test-server.mjs',url:'http://127.0.0.1:5174',reuseExistingServer:!process.env.CI,timeout:30000}]
});
