let selectedAvatar = null;
let username = '';

function showAvatarSelection() {
    const usernameInput = document.getElementById('username');
    username = usernameInput.value.trim();

    if (!username) {
        alert('Please enter a username');
        return;
    }

    document.getElementById('displayUsername').textContent = username;
    document.getElementById('usernameSection').classList.add('hidden');

    const avatarSection = document.getElementById('avatarSection');
    avatarSection.classList.remove('hidden');

    setTimeout(() => {
        avatarSection.classList.add('show');
    }, 10);
}

function selectAvatar(element, avatar) {
    selectedAvatar = avatar;

    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    element.classList.add('selected');

    setTimeout(() => {
        submitForm();
    }, 300);
}

function submitForm() {
    const data = {
        username: username,
        avatar: selectedAvatar
    };

    console.log('Form submitted:', data);

    window.location.href = 'https://example.com/welcome?user=' + encodeURIComponent(username);
}