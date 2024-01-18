const footer = document.querySelector('footer');
const iframe = document.createElement('iframe');
iframe.innerHTML = '<iframe src="https://null7238.github.io/ecwid-google-reviews/google-reviews.html" frameborder="0" width="100%" height="450"></iframe>';
footer.prepend(iframe);