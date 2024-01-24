document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access');

    if (!accessToken) {
        console.log('No access token found. You are not logged in!');
        // Maybe redirect to login page?
        return;
    }

    fetch('https://10.12.14.3/api/profile', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }
    })

    .then(response => {
        if (!response.ok) {
            throw new Error('Profile could not be fetched!');
        }
        return response.json();
    })

    .then(data => {
        displayUserProfile(data);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
});

function displayUserProfile(data) {
    if (data.profile_avatar) {
        const profileAvatar = document.getElementById('profileAvatar');
        profileAvatar.src = data.profile_avatar;
        profileAvatar.style.display = 'block';
    }
    document.getElementById('userEmail').textContent = data.email || 'No email found';
    document.getElementById('userName').textContent = data.username || 'No Username found';
    const gamesPlayed = data.games_played !== null && data.games_played !== undefined ? data.games_played : 'No games played';
    document.getElementById('gamesPlayed').textContent = gamesPlayed;

    const gamesWon = data.games_won !== null && data.games_won !== undefined ? data.games_won : 'No games won';
    document.getElementById('gamesWon').textContent = gamesWon;

    const gamesLost = data.games_lost !== null && data.games_lost !== undefined ? data.games_lost : 'No games lost';
    document.getElementById('gamesLost').textContent = gamesLost;

    const gamesTied = data.games_tied !== null && data.games_tied !== undefined ? data.games_tied : 'No games tied';
    document.getElementById('gamesTied').textContent = gamesTied;

    document.getElementById('profileSection').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('reg').style.opacity = 0;
    document.getElementById('login42Button').style.display = 'none';
}

document.getElementById('viewUsersButton').addEventListener('click', function() {
    toggleDisplayUsersList();
});

function fetchUsersList() {
    const accessToken = localStorage.getItem('access');

    fetch('https://10.12.14.3/api/users', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(users => {
        displayUsersList(users);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function displayUsersList(users) {
    const usersListDiv = document.getElementById('usersList');
    usersListDiv.innerHTML = '';

    console.log(users);

    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = `Username: ${user.username}`;

        const buddyButton = document.createElement('button');
        if (user.is_buddy) {
            buddyButton.textContent = 'Unbuddy';
            buddyButton.onclick = function() {
                handleBuddyClick(user.id, true);
            }
        } else {
            buddyButton.textContent = 'Buddy';
            buddyButton.onclick = function() {
                handleBuddyClick(user.id, false);
            }
        }

        userItem.appendChild(buddyButton);
        usersListDiv.appendChild(userItem);
    });
    usersListDiv.style.display = 'block';
}

function handleBuddyClick(userId, isBuddy) {
    const accessToken = localStorage.getItem('access');
    const method = isBuddy ? 'DELETE' : 'POST';
    const url = `https://10.12.14.3/api/add-buddy/${userId}/`;

    console.log(method, url);

    fetch(url, {
        method: method,
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => {
        console.log(response.status);
        return response.json();
    })
    .then(data => {
        console.log(data);
        console.log(data.message);
        fetchUsersList();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function toggleDisplayUsersList() {
    const usersListDiv = document.getElementById('usersList');
    if (usersListDiv.style.display === 'none' || usersListDiv.style.display === '') {
        fetchUsersList();
        usersListDiv.style.display = 'block';
    } else {
        usersListDiv.style.display = 'none';
    }
}

window.displayUserProfile = displayUserProfile;

document.getElementById('avatarForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const accessToken = localStorage.getItem('access');
    const fileInput = document.getElementById('avatarInput');

    if (!fileInput.files[0]) {
        console.log('No file input found!');
        return;
    }

    let formData = new FormData();
    formData.append('profile_avatar', fileInput.files[0]);

    fetch('https://10.12.14.3/api/update-avatar/', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Avatar could not be uploaded!');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success: Avatar was updated!');
        const profileAvatar = document.getElementById('profileAvatar');
        profileAvatar.src = data.profile_avatar;
        profileAvatar.style.display = 'block';
        document.getElementById('avatarForm').reset();
        window.location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
    });
});