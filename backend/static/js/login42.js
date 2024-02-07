import appState, { notifyListeners } from "./appstate.js";

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
            throw new Error('Not authorized');
        }
        return response.json();
    })
    .then(profileData => {
        // displayUserProfile(profileData);
        appState.userProfile = profileData;
        notifyListeners();
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