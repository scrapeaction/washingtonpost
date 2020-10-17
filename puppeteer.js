'use strict';
const puppeteer = require('puppeteer');

crawlPage();

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

function crawlPage() {
    (async () => {

        const args = [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--blink-settings=imagesEnabled=true",
        ];
        const options = {
            args,
            headless: true,
            ignoreHTTPSErrors: true
        };

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        
        await page.goto("https://washingtonpost.com", {
            waitUntil: 'networkidle0',
            timeout: 0
        });

        const addresses = await page.$$eval('a', as => as.map(a => a.href));

        for (let i = 0; i < addresses.length; i++) {
            console.log(`Now serving ${i} of ${addresses.length}: ${addresses[i]}`);
            try {
                await page.goto(addresses[i], { waitUntil: "networkidle0", timeout: 0 });

                const watchDog = page.waitForFunction(() => 'window.status === "ready"', { timeout: 0 });
                await watchDog;

                await delay(4000);
                console.log(`waited for four seconds`);
                await page.screenshot({
                    path: `screenshots/screenshots-${i}.png`,
                    fullPage: true
                });
                await page.screenshot({
                    path: `screenshots/screenshots-${i}-fold.png`,
                    fullPage: false
                });
            } catch (error) {
                console.error(error);
            } finally {
                console.log(`Finished serving ${i} of ${addresses.length}: ${addresses[i]}`);
            };
        }

        await page.close();
        await browser.close();

    })().catch((error) => {
        console.error(error);
    });

}
