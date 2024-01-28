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

console.log(JSON.stringify(savedReviews));