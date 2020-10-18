'use strict';
const puppeteer = require('puppeteer');

crawlPage("https://washingtonpost.com", "frontpage");
crawlPage("https://washingtonpost.com/todays_paper/updates/", "todays-papeer");
crawlPage("https://washingtonpost.com/politics/", "politics");
crawlPage("https://washingtonpost.com/opinions", "opinions");
crawlPage("https://washingtonpost.com/national/investigations", "investigations");
crawlPage("https://washingtonpost.com/business/technology", "technology");
crawlPage("https://washingtonpost.com/world", "world");
crawlPage("https://washingtonpost.com/dc", "dc");
crawlPage("https://washingtonpost.com/sports", "sports");
crawlPage("https://washingtonpost.com/race-america", "race-and-reckoning");
crawlPage("https://washingtonpost.com/entertainment", "arts-and-entertainment");
crawlPage("https://washingtonpost.com/business", "business");
crawlPage("https://washingtonpost.com/personal-finance", "personal-finance");
crawlPage("https://washingtonpost.com/climate-environment", "climante-and-environment");
crawlPage("https://washingtonpost.com/elections", "elections");
crawlPage("https://washingtonpost.com/immigration", "immigration");
crawlPage("https://washingtonpost.com/transportation", "transportation");
crawlPage("https://washingtonpost.com/travel", "travel");
crawlPage("https://washingtonpost.com/video-games", "video-games");
crawlPage("https://washingtonpost.com/outlook", "outlook");
crawlPage("https://washingtonpost.com/outlook/five-myths", "five-myths");


function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

function crawlPage(url, prefix) {
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

        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 0
        });

        await page.screenshot({
            path: `screenshots/${prefix}.png`,
            fullPage: true
        });
        await page.screenshot({
            path: `screenshots/${prefix}-fold.png`,
            fullPage: false
        });

        const addresses = await page.$$eval('a', as => as.map(a => a.href));
        const padding = addresses.length % 10;
        for (let i = 0; i < addresses.length; i++) {
            try {
                if (addresses[i].startsWith("http") === true) {
                    console.log(`Now serving ${i} of ${addresses.length}: ${addresses[i]}`);
                    await page.goto(addresses[i], { waitUntil: "networkidle0", timeout: 300000 });

                    const watchDog = page.waitForFunction(() => 'window.status === "ready"', { timeout: 300000 });
                    await watchDog;

                    await page.screenshot({
                        path: `screenshots/${prefix}-${i.toString().padStart(padding, '0')}.png`,
                        fullPage: true
                    });
                    await page.screenshot({
                        path: `screenshots/${prefix}-${i.toString().padStart(padding, '0')}-fold.png`,
                        fullPage: false
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                console.log(`Finished with ${i} of ${addresses.length}: ${addresses[i]}`);
            };
        }

        await page.close();
        await browser.close();

    })().catch((error) => {
        console.error(error);
    });

}
