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
    window.location.href=`/document/${dataId}/v/${version}`;
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
  const dataId = $(".title-input").data("id"); 

  if (!user) {
    alert("Enter email or username");
    return;
  }

  try {
    const res = await fetch("/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, access, docId: dataId })
    });

    const data = await res.json();

if (data.success) {
  window.location.href = data.redirectUrl;
}
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});

$(document).on("click", ".editbtn", function () {
  const dataId = $(".title-input").data("id");
  window.location.href = `/document/edit/${dataId}`;
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

  fetch(`/document/${docId}`, {
    method: "DELETE"
  })
  .then(() => {
    window.location.href = "/home?notification=Successfully Deleted";
  });
});

/////////////////Put Request////////////////

const roleButtons = document.querySelectorAll(".role-btn");
roleButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    const role = btn.dataset.role; // EDITOR or VIEWER
    console.log(role);
    const email = document.getElementById("accessEmail").innerText;
    const documentId = document.querySelector(".title-input").dataset.id; // set this when opening access box
    try {
      const res = await fetch(`/access/edit/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personemail: email,
          role: role
        })
      });
      if (!res.ok) throw new Error("Failed to update role");
      alert(`Access updated to ${role}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  });
});


////////delete request for access amnagement

const removeAccessBtn = document.querySelector(".remove-access");

removeAccessBtn.addEventListener("click", async () => {
  const email = document.getElementById("accessEmail").innerText;
  const documentId = document.querySelector(".title-input").dataset.id;

  try {
    console.log("success");
    const res = await fetch(`/access/${documentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personemail: email
      })
    });
    console.log("success");

    if (!res.ok) throw new Error("Failed to remove access");
    console.log("success");

    alert("Access removed successfully");
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
});

// Simple toast from query parameter
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('notification');
    
    if (message) {
        const toast = $('#loginToast');
        $('#toastMessage').text(decodeURIComponent(message));
        toast.show();
        
        setTimeout(() => toast.addClass('show'), 100);
        setTimeout(() => toast.removeClass('show'), 3100);
        
        // Clean URL (remove query param)
        window.history.replaceState({}, '', window.location.pathname);
    }
});