import {test,expect} from '@playwright/test';
test('ticker sits after lifecycle, labels demo data and routes its action',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 const ticker=page.getByRole('region',{name:'Protocol risk examples'});await ticker.scrollIntoViewIfNeeded();await expect(ticker).toContainText('Not live data');await expect(ticker).toContainText('No verified incident imported');
 expect(await page.locator('#features').evaluate(e=>e.nextElementSibling?.classList.contains('risk-ticker'))).toBe(true);
 await expect(ticker.locator('.ticker-group')).toHaveCount(1);await ticker.getByRole('button',{name:/Replay example/}).click();await expect(page.getByRole('heading',{name:'Replay Theater',exact:true})).toBeVisible();
});
test('ticker has pause controls and inert decorative duplicates',async({page})=>{
 await page.goto('/');const ticker=page.getByRole('region',{name:'Protocol risk examples'});await ticker.scrollIntoViewIfNeeded();await ticker.getByRole('button',{name:'Pause risk ticker'}).click();expect(await ticker.locator('.ticker-track').evaluate(e=>getComputedStyle(e).animationPlayState)).toBe('paused');await expect(ticker.locator('.ticker-group[inert]')).toHaveCount(1);
});
test('mobile ticker does not overflow page and lifecycle stays non-glass',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.locator('.risk-ticker').scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await page.locator('.lifecycle-section').evaluate(e=>getComputedStyle(e).backdropFilter)).toBe('none');
});
