const appState = {
    isLoggedIn: false,
    userProfile: null,
    notifications: [],
    userList: [],
};

const listeners = [];

export function subscribe(listener) {
    listeners.push(listener);
}

export function notifyListeners() {
    listeners.forEach(listener => listener());
}

export function updateLoginStatus(playerId, isLoggedIn) {
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
            throw new Error('Failed to update login status');
        }
    })
    .catch(error => {
        console.error('Error updating login status:', error);
    });
}

export default appState;