import appState, { notifyListeners, updateLoginStatus } from "./appstate.js";

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
        console.log('No access token found');
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
            throw new Error('Logout failed!');
        }
        return response.json();
    })
    .then(data => {
        console.log('Logout successful!', data);
        alert('Logout successful!');
        localStorage.removeItem('access');
        appState.isLoggedIn = false;
        appState.userProfile = null;
        notifyListeners();
        window.location.reload();
    })
    .catch(error => {
        console.log('Error during Logout:', error);
    });
}