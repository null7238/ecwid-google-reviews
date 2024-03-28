const puppeteer = require('puppeteer');
const fs = require('fs');
const { error } = require('console');

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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.google.com/search?q=concrete+blonde+aquatics');

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


    await scrollToBottom(page);
    height = await scrollHeight(page);
    console.log(height);


    const reviews = await page.evaluate(() => {
        const allReviews = document.body.querySelectorAll('div[jscontroller="fIQYlf"]');
        let savedReviews = [];

        for (i = 0; i < allReviews.length; ++i) {
            const review = allReviews[i];

            const title = review.querySelector('div[class="TSUbDb"] a').innerText;
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
                    rating: rating.getAttribute("aria-label").substring(6, 7),
                    reviewText: reviewText.innerText.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ''),
                    picture: picture.src,
                    time: time.innerText
                })
            }
        }

        return savedReviews;
    });

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