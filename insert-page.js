const footer = document.querySelector('footer');
const iframe = document.createElement('iframe');
iframe.innerHTML = '<iframe id="googleReviewIframe" src="https://null7238.github.io/ecwid-google-reviews/google-reviews.html" frameborder="0" width="100%"></iframe>';
footer.prepend(iframe);

window.addEventListener('message', function(event) {
    if (event.origin === 'https://null7238.github.io') { 
        document.getElementById('googleReviewIframe').style.height = event.data + 'px';
    }
});