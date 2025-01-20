const randomUseragent = require('random-useragent');
//const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const { error } = require('console');

puppeteer.use(Stealth());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36';

async function scrollHeight(page) {
    const scrollHeight = await page.evaluate(() => {
        let reviewList = document.querySelector('.review-dialog-list');
        return reviewList.scrollHeight;
    });

    return scrollHeight;
}

async function scrollToBottom(page) {
    await page.evaluate(() => {
        let reviewList = document.querySelector('.review-dialog-list');
        reviewList.scrollTo(0, reviewList.scrollHeight);
    });
}

async function hasLoader(page) {
    const loader = await page.evaluate(() => {
        let loader = document.querySelector('.jfk-activityIndicator');
        return !!loader;
    });

    return loader;
}

(async () => {
    const userAgent = randomUseragent.getRandom();
    const UA = userAgent || USER_AGENT;

    const browser = await puppeteer.launch(
        /*{
            headless: false,
            args: ['--window-size=1920,1080']
        }*/
    );
    const page = await browser.newPage();

    await page.setUserAgent(UA);
    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(0);

    await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });

    await page.goto('https://www.google.com/search?q=concrete+blonde+aquatics+winnipeg', { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
        let xpath = "//span[contains(text(),'Google reviews')]";
        let googleReviewButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        googleReviewButton.click();
    });

    await page.waitForSelector('.review-dialog-list')

    await page.evaluate(() => {
        let xpath = "//span[contains(text(),'Newest')]";
        let newestButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        newestButton.click();
    });

    await new Promise(r => setTimeout(r, 2000));
    //await page.waitForSelector('.review-loading', {hidden: false, timeout: 10000});
    //await page.waitForSelector('.review-loading', {hidden: true, timeout: 10000});

    let height = -1;

    while(true) {
        await scrollToBottom(page);

        try {
        await page.waitForSelector('.jfk-activityIndicator', {hidden: false, timeout: 2000});
        } catch(e) {}

        await page.waitForSelector('.jfk-activityIndicator', {hidden: true, timeout: 20000});

        if(!(await hasLoader(page))) {
            let newHeight = await scrollHeight(page);

            if(newHeight == height) {
                console.log('done scrolling');
                break;
            }
    
            height = newHeight;
        }
    }

    const reviews = await page.evaluate(() => {
        const allReviews = document.body.querySelectorAll('div[jscontroller="fIQYlf"]');
        let savedReviews = [];

        for (i = 0; i < allReviews.length; ++i) {
            const review = allReviews[i];

            const title = review.querySelector('div[class="TSUbDb"] a').innerText;
            const profileHref = review.querySelector('div[class="TSUbDb"] a').href;
            const rating = review.querySelector('span[class="lTi8oc z3HNkc"]');
            const reviewText = review.querySelector('span[jscontroller="MZnM8e"]');
            const picture = review.querySelector('img[class="lDY1rd"]');
            const more = review.querySelector('a[class="review-more-link"]');
            const time = review.querySelector('span[class="dehysf lTi8oc"]');

            
            if(more) {
                more.click();
            }

            if(reviewText) {
                savedReviews.push({
                    title,
                    profileHref,
                    rating: rating.getAttribute("aria-label").substring(6, 7),
                    reviewText: reviewText.innerText.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ''),
                    picture: picture.src,
                    time: time.innerText
                })
            }
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

    if(newLength >= oldLength) {
        console.log("We had " + oldLength + " reviews now we have " + newLength);

        content[0] = newLine;
        content = content.join('\n');

        fs.writeFileSync(filePath, content);
    } else {
        throw new error('old reviews are larger than new ones');
    }

    await browser.close();
})();