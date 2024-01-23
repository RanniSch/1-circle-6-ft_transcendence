document.getElementById('login42Button').addEventListener('click', function() {
    const oauthUrl = `https://localhost/api/oauth/authorize`;
    window.location.href = oauthUrl;
});

function loadProfile() {
    const access = localStorage.getItem('access');
    fetch('https://localhost/api/profile/', {
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
        displayUserProfile(profileData);
    })
    .catch((error) => {
        console.error('Error:', error);
    }); 
}

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