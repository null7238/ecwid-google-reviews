/*$(".gr-show-more").on('click', function(event) {
            $(this).find(".gr-text").addClass("gr-text-expanded");
        });*/


document.addEventListener('DOMContentLoaded', function(){

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