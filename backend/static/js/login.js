import appState from "./appstate.js";
import { getCurrentLanguage, translations, notifyListeners } from "./appstate.js";

function translate(key) {
    var currentLanguage = getCurrentLanguage();
    return translations[key][currentLanguage];
}

let currentEmail = '';
let currentPassword = '';

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    currentEmail = document.getElementById('email_login').value;
    currentPassword = document.getElementById('password_login').value;

    var data = {
        email: currentEmail,
        password: currentPassword
    };

    fetch(`https://${host}/api/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            alert(translate('Invalid username or password'));
            throw new Error(translate('Invalid username or password'));
        }
        return response.json();
    })
    .then(data => {
        console.log('Initial Login Successful...');
        if (data.require_2fa) {
            appState.isLoggedIn = false;
            showTwoFactorModal();
        } else {
            completeLoginProcess(data);
        }
    })
    .catch((error) => {
        console.error('Error:', translate("Invalid Email and/or Password"));
    });
});

function showTwoFactorModal() {
    var modal = document.getElementById('twoFactorModal');
    var span = document.getElementsByClassName('close')[0];

    modal.style.display = 'block';

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
          modal.style.display = 'none';
        }
    }

    document.getElementById('submit2FACode').onclick = function() {
        const twoFactorCode = document.getElementById('twoFactorCode').value;
        if (twoFactorCode) {
            submitTwoFactorCode(twoFactorCode);
            modal.style.display = 'none';
        }
    }
}

function submitTwoFactorCode(twoFactorCode) {
    var data = {
        email: currentEmail,
        password: currentPassword,
        '2fa_token': twoFactorCode
    };
    fetch(`https://${host}/api/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Invalid two-factor authentication code!'));
        }
        return response.json();
    })
    .then(completeLoginProcess)
    .catch((error) => {
        console.log('Error Prompt2FA:', error);
    });
}

function completeLoginProcess(data) {
    console.log('Login Completed!');
    document.getElementById('loginForm').reset();
    localStorage.setItem('access', data.access);

    appState.isLoggedIn = true;

    fetch(`https://${host}/api/update-login-status/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + data.access,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_logged_in: true })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Failed to update login status'));
        }
        return response.json();
    })
    .then(() => {
        loadProfile();
        window.location.reload();
    })
    .catch((error) => {
        console.error('Error update login status:', error);
    });
}

// checkbox show password
document.getElementById('togglePasswordLogin').addEventListener('change', function(event) {
    const passwordInput = document.getElementById('password_login');
    if (event.target.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});

function loadProfile() {
    const access = localStorage.getItem('access');
    fetch(`https://${host}/api/profile/`, {
        headers: {
            'Authorization': 'Bearer ' + access 
        }
    })
    .then(response => {
        if (!response.ok) {
            document.getElementById('loginForm').reset();
            throw new Error(translate('Not authorized'));
        }
        return response.json();
    })
    .then(profileData => {
        appState.userProfile = profileData;
        notifyListeners();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}