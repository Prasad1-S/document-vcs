$(function () {

  /* ---------- NAVIGATION ---------- */

  $(document).on('click', '.prof', () => location.href = "/profile");
  $(document).on('click', '.newDoc', () => location.href = "/new");
  $(document).on('click', '.home', () => location.href = "/home");
  $(document).on('click', '.setti', () => location.href = "/settings");
  $(document).on('click', '.log', () => location.href = "/logout");

  /* ---------- PROFILE DROPDOWN ---------- */

  $(document).on('click', '.profile', function (e) {
    e.stopPropagation();
    $(".logout").toggle();
  });

  $(document).on('click', '.profile', function (e) {
    e.stopPropagation();
    $(".logout").toggle();
  });

  $(document).on('click', '.logout', function (e) {
    e.stopPropagation();
  });

  /* ---------- SHARE MODAL ---------- */

  $(".overlay, .sharebox").hide();

  $(document).on("click", ".sharebtn", function () {
    $(".overlay, .sharebox").fadeIn(150);
  }); 

  $(document).on("click",".btn", function(){
    const dataId = $(".title-input").data("id");
    const version = $(".title-input").data("version")
    window.location.href=`/${dataId}/v/${version}`;
  });

  $(document).on("click", ".overlay", function () {
    $(".overlay, .sharebox").fadeOut(150);
    $("#accessMenu").hide();
  });

  /* ---------- ACCESS DROPDOWN ---------- */

  $(document).on("click", "#accessBtn", function (e) {
    e.stopPropagation();
    $("#accessMenu").toggle();
  });

  $(document).on("click", ".dropdown-item", function () {
    $(".dropdown-item").removeClass("active");
    $(this).addClass("active");

    $("#accessBtn").html(
      `${$(this).text()} <span class="caret">▾</span>`
    );

    $("#accessMenu").hide();

    console.log("Access level:", $(this).data("value"));
  });

  /* ---------- GLOBAL CLOSE ---------- */

  $(document).on("click", function () {
    $(".logout").hide();
    $("#accessMenu").hide();
  });


$(document).on("click", ".share-btn", async function () {
  const user = $(".share-input").val().trim();
  const access = $(".dropdown-item.active").data("value");
  const dataId = $(".title-input").data("id"); // ✅ FIX

  if (!user) {
    alert("Enter email or username");
    return;
  }

  try {
    const res = await fetch("/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, access, docId: dataId })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed");
      return;
    }

    alert("Shared successfully");
    $(".share-input").val("");
    $(".overlay, .sharebox").fadeOut(150);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});

$(document).on("click", ".editbtn", function () {
  const dataId = $(".title-input").data("id"); // ✅ FIX
  window.location.href = `/edit/${dataId}`;
});


///////overlay handler

$(document).on("click", ".overlay", function () {
  $(".overlay, .sharebox").fadeOut(150);
  $("#accessMenu").hide();
});


/* ---------- MANAGE ACCESS ---------- */

$("#accessOverlay, #accessBox").hide();

$(document).on("click", ".manage-access", function (e) {
  e.stopPropagation();

  const people = $(this).closest(".people");

  const name = people.data("name");
  const email = people.data("email");

  $("#accessName").text(name);
  $("#accessEmail").text(email);

  $("#accessOverlay, #accessBox").fadeIn(150);
});

/* close modal */
$(document).on("click", "#accessOverlay", function () {
  $("#accessOverlay, #accessBox").fadeOut(150);
});


});

// delete button js

const deleteBtn = document.querySelector(".deletebtn");
const deleteOverlay = document.getElementById("deleteOverlay");
const deleteBox = document.getElementById("deleteBox");
const cancelDelete = document.querySelector(".cancel-delete");
const confirmDelete = document.querySelector(".confirm-delete");

deleteBtn.addEventListener("click", () => {
  deleteOverlay.style.display = "block";
  deleteBox.style.display = "block";
});

cancelDelete.addEventListener("click", closeDeleteModal);
deleteOverlay.addEventListener("click", closeDeleteModal);

function closeDeleteModal() {
  deleteOverlay.style.display = "none";
  deleteBox.style.display = "none";
}

confirmDelete.addEventListener("click", () => {
  const docId = document.querySelector(".title-input").dataset.id;

  fetch(`/doc/${docId}`, {
    method: "DELETE"
  })
  .then(() => {
    window.location.href = "/home";
  });
});
