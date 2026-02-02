$(function () {
$(".newDocument").on("click",function(){
        window.location.href="/new";
})

$(".edit").on("click",function(){
        window.location.href="/edit";
})
  
$(document).on('click', '.share', function(e){
        e.stopPropagation();
        var $box = $('.ShareBox');

        if ($('.modal-overlay').length === 0) {
            $('body').append('<div class="modal-overlay"></div>');
        }
        var $overlay = $('.modal-overlay');
        $overlay.fadeIn(120);
        $box.fadeIn(150);
});

$(document).on('click', '.prof', function (e) {
   window.location.href="/profile";
});

$(document).on('click', '.newDoc', function(e){
    window.location.href="document/new";
});

$(document).on('click','.home', function(e){
    window.location.href="/home";
});

$(document).on('click', '.setti', function (e) {
   window.location.href="/settings";
});

$(document).on('click', '.log', function (e) {
    window.location.href="/logout";
});

$(document).on('click', '.profile', function (e) {
    e.stopPropagation();
    $(".logout").toggle();
});

$(document).on('click', function () {
    $(".logout").hide();
});

$(document).on('click', '.ShareBox', function(e){
        e.stopPropagation();
});

    // Hide ShareBox when clicking the overlay or anywhere else
$(document).on('click', function(){
        $('.ShareBox').fadeOut(120);
        $('.modal-overlay').fadeOut(120, function(){ $(this).remove(); });
});

    // Clicking the overlay should also close
$(document).on('click', '.modal-overlay', function(){
        $('.ShareBox').fadeOut(120);
        $('.modal-overlay').fadeOut(120, function(){ $(this).remove(); });
});

    // Hide after form submit (prevent real submit here)
$(document).on('submit', '.ShareBox form', function(e){
        e.preventDefault();
        $('.ShareBox').fadeOut(120);
        $('.modal-overlay').fadeOut(120, function(){ $(this).remove(); });
});

// ////////////////Doc view

document.querySelectorAll(".DocCard").forEach(card => {
  card.addEventListener("click", () => {
    const docId = card.dataset.docId;

    window.location.href = `document/view/${docId}`;
  });
});

const buttons = document.querySelectorAll(".filters button");
const docs = document.querySelectorAll(".DocCard");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;

        /* 🔹 Active button handling */
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        /* 🔹 Filtering docs */
        docs.forEach(doc => {
            if (filter === "all") {
                doc.style.display = "block";
            } 
            else if (doc.classList.contains(filter)) {
                doc.style.display = "block";
            } 
            else {
                doc.style.display = "none";
            }
        });
    });
});

/* 🔹 Default active state */
document.querySelector('[data-filter="all"]').classList.add("active");

});

// ////////////search btn implementation

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const docCards = document.querySelectorAll(".DocCard");
    const filterButtons = document.querySelectorAll(".filters button");

    let activeFilter = "all";

    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();

        docCards.forEach(card => {
            const title = card.querySelector(".title").innerText.toLowerCase();
            const matchesSearch = title.includes(query);
            const matchesFilter =
                activeFilter === "all" || card.classList.contains(activeFilter);

            if (matchesSearch && matchesFilter) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }



    searchInput.addEventListener("input", applyFilters);

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            activeFilter = btn.dataset.filter;
            applyFilters();
        });
    });
});
