import appState, { notifyListeners, updateLoginStatus, translations, getCurrentLanguage } from "./appstate.js";

function translate(key) {
    var currentLanguage = getCurrentLanguage();
    return translations[key][currentLanguage];
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            updateLoginStatus(appState.userProfile.id, false);
            logoutUser();
        });
    }
});

function logoutUser() {
    const accessToken = localStorage.getItem('access');

    if (!accessToken) {
        console.log(translate('No access token found'));
        return;
    }
    fetch(`https://${host}/api/logout/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'ContentType': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Logout failed!'));
        }
        return response.json();
    })
    .then(data => {
        console.log(translate('Logout successful!'), data);
        alert(translate('Logout successful!'));
        localStorage.removeItem('access');
        appState.isLoggedIn = false;
        appState.userProfile = null;
        notifyListeners();
        window.location.reload();
    })
    .catch(error => {
        console.log(translate('Error during Logout:'), error);
    });
}