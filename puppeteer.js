'use strict';
const puppeteer = require('puppeteer');

crawlPage();

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
            ignoreHTTPSErrors: true,
        };

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        await page.goto("http://washingtonpost.com/", {
            waitUntil: 'networkidle2',
            timeout: 300000
        });

        const addresses = await page.$$eval('a', as => as.map(a => a.href));
        console.log(addresses);

        for (let i = 0; i < addresses.length; i++) {
            console.log(addresses[i]);
            const name = addresses[i].lastIndexOf('/');
            console.log({ name });
            try {
                await page.goto(addresses[i], { "waitUntil": "networkidle2", timeout: 300000 });
                await page.screenshot({
                    path: `screenshots/screenshots-${i}.png`,
                    fullPage: true
                });
            } catch (error) {
                console.error(error);
            };
        }

        await page.close();
        await browser.close();

    })().catch((error) => {
        console.error(error);
    });

}
