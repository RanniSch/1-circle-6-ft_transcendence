import appState, { notifyListeners, translations, getCurrentLanguage } from "./appstate.js";

function translate(key) {
    var currentLanguage = getCurrentLanguage();
    return translations[key][currentLanguage];
}

document.getElementById('login42Button').addEventListener('click', function() {
    const oauthUrl = `https://${host}/api/oauth/authorize`;
    window.location.href = oauthUrl;
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
            throw new Error(translate('Not authorized'));
        }
        return response.json();
    })
    .then(profileData => {
        appState.userProfile = profileData;
        notifyListeners();
        const PlayerId = profileData.id;
        updateLoginStatus(PlayerId, true);
    })
    .catch((error) => {
        console.error('Error:', error);
    }); 
}

window.loadProfile = loadProfile;

function checkAuthentication() {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
        loadProfile();
    } else {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access');
        if (accessToken) {
            localStorage.setItem('access', accessToken);
            window.history.replaceState(null, null, window.location.pathname)
            loadProfile();
        }
    }
}

window.addEventListener('load', checkAuthentication);

function updateLoginStatus(playerId, isLoggedIn) {
    const accessToken = localStorage.getItem('access');
    fetch(`https://${host}/api/update-login-status/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            player_id: playerId,
            is_logged_in: isLoggedIn
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Failed to update login status'));
        }
    })
    .catch(error => {
        console.error('Error updating login status:', error);
    });
}