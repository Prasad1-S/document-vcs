$(function () {

  // NAV
  $('.prof').click(()=>location.href='/profile');
  $('.newDoc').click(()=>location.href='/new');
  $('.home').click(()=>location.href='/home');
  $('.setti').click(()=>location.href='/settings');
  $('.log').click(()=>location.href='/logout');

  $('.profile').click(e=>{
    e.stopPropagation();
    $('.logout').toggle();
  });

  $(document).click(()=>$('.logout').hide());
  $('.logout').click(e=>e.stopPropagation());

  // VERSION PREVIEW
  $('.vh-card').on('click', function () {
    const docid=$(this).data("id");
    const version=$(this).data("version");
    console.log(version);
    window.location=`/${docid}/v/${version}`
  });

  const rollbackBtn = document.getElementById("rollbackBtn");
const modal = document.getElementById("rollbackModal");

const cancelBtn = document.getElementById("cancelRollback");
const confirmBtn = document.getElementById("confirmRollback");

// Example version data (replace dynamically)
const versionData = {
  number: "v12",
  name: "Added sharing logic",
  editedBy: "ananyaghosh@gmail.com"
};

let selectedVersion = null;

// when a version card is clicked, store its info
$('.vh-card').on('click', function () {
  selectedVersion = {
    version: $(this).data('version'),
    editor: $(this).data('editor'),
    name: $(this).find('.summary').text().trim()
  };

  console.log("Selected version:", selectedVersion);
});

// rollback button
$('#rollbackBtn').on('click', function () {
  if (!selectedVersion) {
    alert("Please select a version to rollback to.");
    return;
  }

  $('#versionNumber').text('v' + selectedVersion.version);
  $('#versionName').text(selectedVersion.name || '—');
  $('#lastEditedBy').text(selectedVersion.editor);

  $('#rollbackModal').removeClass('hidden');
});

// cancel
$('#cancelRollback').on('click', function () {
  $('#rollbackModal').addClass('hidden');
});

// confirm
$('#confirmRollback').on('click', function () {
  $('#rollbackModal').addClass('hidden');

  console.log("ROLLBACK CONFIRMED:", selectedVersion);

  // 🔥 backend call goes here
  // POST /rollback/:docid/:version
});


});


