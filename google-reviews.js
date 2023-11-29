document.addEventListener('DOMContentLoaded', function(){
    let flexWrapper = document.querySelector('.gr-flex-wrapper');
    let allReviews = document.querySelectorAll('.gr-review');
    let lastReview = allReviews[allReviews.length - 1];
    
    let startX = 0;
    let currentX = 0;
    let mouseDown = false;
    let lastX = 0;

    function sliderMove(e) {
        if(mouseDown) {
            let x = e.x ?? e.touches[0].clientX;
            currentX = x - startX + lastX;
            flexWrapper.style.transform = "translate3d(" + currentX + "px, 0px, 0px)";
        }
    }

    function sliderStart(e) {
        let x = e.x ?? e.touches[0].clientX;
        startX = x;
        mouseDown = true;
    }

    function sliderEnd(e) {
        mouseDown = false;

        if(currentX > 0) {
            currentX = 0;
        }

        if(lastReview.getBoundingClientRect().right < flexWrapper.offsetWidth) {
            currentX = (flexWrapper.scrollWidth - flexWrapper.offsetWidth) * -1;
        }

        flexWrapper.style.transform = "translate3d(" + currentX + "px, 0px, 0px)";

        lastX = currentX;  
    }

    flexWrapper.addEventListener("mousemove",sliderMove);
    flexWrapper.addEventListener("mousedown",sliderStart);
    flexWrapper.addEventListener("mouseup",sliderEnd);

    flexWrapper.addEventListener("touchmove",sliderMove);
    flexWrapper.addEventListener("touchstart",sliderStart);
    flexWrapper.addEventListener("touchend",sliderEnd);

    document.querySelectorAll('.gr-text').forEach((div => {
        if(div.offsetHeight >= 85) {
            div.classList.add('gr-text-gradient')
            div.parentNode.querySelector('.gr-show-more').classList.remove('gr-display-none');
        }
    }));

    document.querySelectorAll('.gr-show-more').forEach((div)=>{
        div.addEventListener("click",function(e){
            let grText = this.parentNode.querySelector('.gr-text');
            grText.classList.remove('gr-text-gradient');
            grText.classList.add('gr-text-expanded');

            this.classList.add('gr-display-none');
            this.parentNode.querySelector('.gr-show-less').classList.remove('gr-display-none');
         },false);
    });

    document.querySelectorAll('.gr-show-less').forEach((div)=>{
        div.addEventListener("click",function(e){
            let grText = this.parentNode.querySelector('.gr-text');
            grText.classList.add('gr-text-gradient');
            grText.classList.remove('gr-text-expanded');

            this.classList.add('gr-display-none');
            this.parentNode.querySelector('.gr-show-more').classList.remove('gr-display-none');
         },false);
    });
});