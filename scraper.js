const puppeteer = require('puppeteer');

const fs = require('fs');
const { error } = require('console');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36';

async function scrollHeight(page) {
    const scrollHeight = await page.evaluate(() => {
        let reviewList = document.querySelector('div.dS8AEf');
        return reviewList.scrollHeight;
    });

    return scrollHeight;
}

async function scrollToBottom(page) {
    await page.evaluate(() => {

        
        let loader = document.querySelector('.qjESne');

        if(loader) {
            loader.scrollIntoView()
        } else {
            let reviewList = document.querySelector('div.dS8AEf');
            reviewList.scrollTo(0, 99999999999999);
        }
    });
}

async function hasLoader(page) {
    const loader = await page.evaluate(() => {
        let loader = document.querySelector('.qjESne');

        return !!loader;
    });

    return loader;
}

(async () => {
    
    const browser = await puppeteer.launch(
        {
            headless: true,
            args: ['--window-size=1920,1080']
        }
    );
    const page = await browser.newPage();


    await page.setUserAgent(USER_AGENT);
    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(0);

    await page.setExtraHTTPHeaders({
        //'sec-ch-prefers-color-scheme': 'light',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", ";Not A Brand";v="99"',
        //'sec-ch-ua-arch': 'x86',
        //'sec-ch-ua-bitness': '64',
        //'sec-ch-ua-form-factors': 'Desktop',
        //'sec-ch-ua-full-version': '132.0.6834.83',
        //'sec-ch-ua-full-version-list': '"Not A(Brand";v="8.0.0.0", "Chromium";v="132.0.6834.83", "Google Chrome";v="132.0.6834.83"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': 'Windows',
        //'referer': 'https://www.google.com/',
        //'sec-ch-ua-platform-version:': '10.0.0',
        //'sec-ch-ua-wow64': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        //'x-browser-channel':'stable',
        //'x-browser-copyright':'Copyright 2025 Google LLC. All rights reserved.',
        //'x-browser-validation':'Ty5481SnuDG2fxASUTOpmh9tIrU=',
        //'x-browser-year':'2025'
    })

    await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });
    
    //throw new Error('we got a captcha instead of the page we were expecting')
    console.log("navigating to search page");
    await page.goto('https://www.google.com/maps/place/Concrete+Blonde+Aquatics/@49.9114608,-97.1076163,706m/data=!3m1!1e3!4m8!3m7!1s0x52ea712bf6671901:0x6975ea7e720d8784!8m2!3d49.9114608!4d-97.1050414!9m1!1b1!16s%2Fg%2F11fkcwj4c6?entry=ttu', { waitUntil: 'networkidle2' });

    const url = await page.url();
    console.log(`${url} has been loaded`);

    if(url.includes('sorry')) {
        throw new Error('captcha detected');
    }

    console.log("Clicking on sort");
    await page.evaluate(() => {
        let xpath = "//span[contains(text(),'Sort')]";
        let sortButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        sortButton.click();
    });

    await new Promise(r => setTimeout(r, 100));


    console.log("Sorting by newest");

    await page.evaluate(() => {
        let xpath = "//div[contains(text(),'Newest')]";
        let newestButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        newestButton.click();        
    });

    let height = -1;
    console.log(`scroll to bottom of reviews`)

    while(true) {
        await scrollToBottom(page);

        await new Promise(r => setTimeout(r, 200));

        if(!(await hasLoader(page))) {
            console.log('no loader found, check height')
            let newHeight = await scrollHeight(page);

            if(newHeight == height) {
                console.log('done scrolling');
                break;
            }
    
            height = newHeight;
        }
    }

    console.log(`click all the more buttons`)
    await page.evaluate(() => {
        const allReviews = document.body.querySelectorAll('div.jftiEf');

        for (i = 0; i < allReviews.length; ++i) {
            const review = allReviews[i];
            const more = review.querySelector('button[aria-label="See more"]');

            if(more) {
                more.click();
            }
        }
    });

    await new Promise(r => setTimeout(r, 1000));
    await scrollToBottom(page);

    console.log(`scrape all the reviews`)
    const reviews = await page.evaluate(() => {
        const allReviews = document.body.querySelectorAll('div.jftiEf');
        let savedReviews = [];

        for (i = 0; i < allReviews.length; ++i) {
            const review = allReviews[i];

            const title = review.querySelector('div.d4r55').innerText;
            const profileHref = review.querySelector('button.al6Kxe').getAttribute('data-href');
            const rating = review.querySelector('span.kvMYJc');
            const reviewText = review.querySelector('span.wiI7pd');
            const picture = review.querySelector('img[class="NBa7we"]');
            const more = review.querySelector('button[aria-label="See more"]');
            const time = review.querySelector('span[class="rsqaWe"]');
            
            if(more) {
                more.click();
            }

            savedReviews.push({
                title,
                profileHref,
                rating: rating.getAttribute("aria-label").substring(0, 1),
                reviewText: reviewText ? reviewText.innerText.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '') : '',
                picture: picture.src,
                time: time.innerText
            })
        }

        return savedReviews;
    });

    console.log("Latest review")
    console.log(reviews[0])

    var filePath = './google-reviews.js'
    var newLine = 'const reviews = ' + JSON.stringify(reviews)

    let content = fs.readFileSync(filePath).toString().split('\n');
    let newLength = reviews.length
    let oldLength = JSON.parse(content[0].replace('const reviews = ', '')).length;

    console.log("We had " + oldLength + " reviews now we have " + newLength);

    if(newLength >= oldLength) {
        content[0] = newLine;
        content = content.join('\n');

        fs.writeFileSync(filePath, content);
    } else {
        throw new Error(`there are missing reviews. exit`);
    }

    await browser.close();
    
})();