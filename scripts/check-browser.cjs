const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=new URL(process.argv[2]);
(async()=>{
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge'});
 try{
  for(const width of [320,390,820,1440]){
   const page=await browser.newPage({viewport:{width,height:880},hasTouch:width<900,isMobile:width<900});
   await page.route('**/api/visit*',r=>r.fulfill({json:{}}));
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base.href);
   await page.locator('.hero-actions a').first().click();
   await page.locator('#service-rag .service-journey').waitFor();
   assert.equal(await page.locator('.engineering-service').count(),14);
   assert((await page.locator('.engineering-art').count())<16,'offscreen diagrams loaded eagerly');
   const before=await page.evaluate(()=>scrollY);
   await page.mouse.move(80,350);await page.mouse.wheel(0,80);await page.waitForTimeout(500);
   assert(Math.abs(await page.evaluate(()=>scrollY)-before-80)<3);
   await page.locator('#service-rag .service-journey a[href*="#contact"]').click();
   assert.equal(await page.locator('.brief-form select').inputValue(),'rag');
   await page.goto(new URL('?page=project-datafactory',base).href);
   await page.locator('.project-page a[href*="project=datafactory"]').click();
   await page.locator('.brief-project').waitFor();
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('Customer journeys and continuous scrolling passed at four viewport widths');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
