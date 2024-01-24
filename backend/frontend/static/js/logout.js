document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
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
    fetch('https://10.12.14.3/api/logout/', {
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
    })
    .catch(error => {
        console.log('Error during Logout:', error);
    });
}