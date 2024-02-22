import appState from "./appstate.js";
import { notifyListeners, getCurrentLanguage, translations } from "./appstate.js";

function translate(key) {
    var currentLanguage = getCurrentLanguage();
    return translations[key][currentLanguage];
}

document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access');

    if (!accessToken) {
        console.log('No access token found. You are not logged in!');
        return;
    }

    fetch(`https://${host}/api/profile`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }
    })

    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Profile could not be fetched!'));
        }
        return response.json();
    })

    .then(data => {
        displayUserProfile(data);
        appState.isLoggedIn = true;
        appState.userProfile = data;
        notifyListeners();
        fetchMatchHistory();
    })
    .catch(error => {
        console.error('Error Profile:', error);
    });
    setInterval(fetchNotifications, 10000);
});

function fetchMatchHistory() {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        console.log('No access token found. You are not logged in!');
        return;
    }

    fetch(`https://${host}/api/match-history`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Match history could not be fetched!'));
        }
        return response.json();
    })
    .then(matchHistory => {
        displayMatchHistory(matchHistory);
    })
    .catch(error => {
        console.error('Error MatchHistory:', error);
    });
}

function displayMatchHistory(matchHistory) {
    const matchHistoryContainer = document.getElementById('matchHistoryContainer');

    // clear container and prepare toggle button
    matchHistoryContainer.innerHTML = '';

    // create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = translate('Show Match History');
    matchHistoryContainer.appendChild(toggleButton);

    // create container for match history content
    const matchHistoryContent = document.createElement('div');
    matchHistoryContent.style.display = 'none'; // initially hidden
    matchHistoryContainer.appendChild(matchHistoryContent);

    // fill container with content
    const contentHeader = document.createElement('h3');
    contentHeader.textContent = translate('Match History');
    matchHistoryContent.appendChild(contentHeader);

    matchHistory.forEach(match => {
        const matchItem = document.createElement('div');

        const datePlayed = new Date(match.date_played);
        const datePlayedStr = datePlayed.toLocaleDateString('de-DE', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
            hour12: false
        });

        matchItem.innerHTML = `<p>Date: ${datePlayedStr}</p>
                                <p>${match.player1} vs ${match.player2}</p>
                                <p>Winner: ${match.winner || 'No winner'}</p>`;
        matchHistoryContent.appendChild(matchItem);
    });

    // toggle button functionality
    toggleButton.addEventListener('click', function() {
        if (matchHistoryContent.style.display === 'none') {
            matchHistoryContent.style.display = 'block';
            toggleButton.textContent = translate('Hide Match History');
        } else {
            matchHistoryContent.style.display = 'none';
            toggleButton.textContent = translate('Show Match History');
        }
    });
}

function fetchNotifications() {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        console.log(translate('No access token found. You are not logged in!'));
        return;
    }

    fetch(`https://${host}/api/notifications`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Notifications could not be fetched!'));
        }
        return response.json();
    })
    .then(notifications => {
        displayNotifications(notifications);
    })
    .catch(error => {
        console.error('Error Notification:', error);
    });
}

function displayNotifications(notifications) {
    notifications.forEach(notification => {
        alert(notification.message);
        markNotificationsAsRead(notification.id);
    });
}

function markNotificationsAsRead(notificationId) {
    const accessToken = localStorage.getItem('access');
    const url = `https://${host}/api/mark-notifications-read/${notificationId}/`;
    if (!accessToken) {
        console.log(translate('No access token found. You are not logged in!'));
        return;
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Notifications could not be marked as read!'));
        }
        return response.json();
    })
    .then(data => {
        console.log(translate('Notification marked as read!'));
    })
    .catch(error => {
        console.error('Error MarkNotification:', error);
    
    });
}

function displayUserProfile(data) {
    if (data.profile_avatar) {
        console.log('Profile avatar:', data.profile_avatar);
        const profileAvatar = document.getElementById('profileAvatar');
        profileAvatar.src = data.profile_avatar;
        profileAvatar.style.display = 'block';
    }
    document.getElementById('playPongDiv').style.display = 'block';
    document.getElementById('userEmail').textContent = data.email || translate('No email found');
    document.getElementById('userName').textContent = data.username || translate('No Username found');
    const gamesPlayed = data.games_played !== null && data.games_played !== undefined ? data.games_played : 'No games played';
    document.getElementById('gamesPlayed').textContent = gamesPlayed;

    const gamesWon = data.games_won !== null && data.games_won !== undefined ? data.games_won : translate('No games won');
    document.getElementById('gamesWon').textContent = gamesWon;

    const gamesLost = data.games_lost !== null && data.games_lost !== undefined ? data.games_lost : translate('No games lost');
    document.getElementById('gamesLost').textContent = gamesLost;

    const gamesTied = data.games_tied !== null && data.games_tied !== undefined ? data.games_tied : translate('No games tied');
    document.getElementById('gamesTied').textContent = gamesTied;

    document.getElementById('profileSection').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('reg').style.opacity = 0;
    document.getElementById('login42Button').style.display = 'none';

    if (data.logged_in_with_42api) {
        document.getElementById('enable2faButton').style.display = 'none';
    } else {
        document.getElementById('enable2faButton').style.display = 'block';
    }

    // Global variables
    window.playerOne = data.username || 'Player 1';
}

document.getElementById('viewUsersButton').addEventListener('click', function() {
    toggleDisplayUsersList();
});

function fetchUsersList() {
    const accessToken = localStorage.getItem('access');

    fetch(`https://${host}/api/users`, {
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
        console.error('Error FetchUsers:', error);
    });
}

function displayUsersList(users) {
    const usersListDiv = document.getElementById('usersList');
    usersListDiv.innerHTML = '';

    users.forEach(user => {
        const userItem = document.createElement('li');

        const usernameElement = document.createElement('span');
        usernameElement.textContent = `Username: ${user.username}`;
        userItem.appendChild(usernameElement);

        const statusIndicator = document.createElement('span');
        statusIndicator.style.width = '10px';
        statusIndicator.style.height = '10px';
        statusIndicator.style.borderRadius = '50%';
        statusIndicator.style.display = 'inline-block';
        statusIndicator.style.marginLeft = '15px';
        statusIndicator.style.backgroundColor = user.isLoggedIn ? 'green' : 'red';

        userItem.appendChild(statusIndicator);

        const buddyButton = document.createElement('button');
        if (user.isbuddy) {
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

        setInterval(() => {
            statusIndicator.style.backgroundColor = user.is_logged_in ? 'green' : 'red';
        }, 1000);
    });
    usersListDiv.style.display = 'block';
}

function handleBuddyClick(userId, isbuddy) {
    const accessToken = localStorage.getItem('access');
    const method = isbuddy ? 'DELETE' : 'POST';
    const url = `https://${host}/api/add-buddy/${userId}/`;

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
        fetchUsersList();
    })
    .catch(error => {
        console.error('Error HandleBuddy:', error);
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
        console.log(translate('No file input found!'));
        return;
    }

    let formData = new FormData();
    formData.append('profile_avatar', fileInput.files[0]);

    fetch(`https://${host}/api/update-avatar/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Avatar could not be uploaded!'));
        }
        return response.json();
    })
    .then(data => {
        console.log(translate('Success: Avatar was updated!'));
        const profileAvatar = document.getElementById('profileAvatar');
        profileAvatar.src = data.profile_avatar;
        profileAvatar.style.display = 'block';
        document.getElementById('avatarForm').reset();
        window.location.reload();
    })
    .catch(error => {
        console.error('Error Avatar:', error);
    });
});

document.getElementById('deleteAccountButton').addEventListener('click', function() {
    deleteAccount();
});

function deleteAccount() {
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
        console.log(translate('No access token found. You are not logged in!'));
        return;
    }
    
    //Confirm delete
    if (!confirm(translate('Are you sure you want to delete your account?\nThis cannot be reversed and all your data will be lost!'))) {
        return;
    }

    //Prompt for confirmation
    const confirmation = prompt(translate('Please type DELETE to confirm account deletion:'));
    if (confirmation != 'DELETE') {
        alert(translate('Account deletion cancelled!'));
        return;
    }

    fetch(`https://${host}/api/delete-account/`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: 'DELETE'})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Account could not be deleted!'));
        }
        return response.json();
    })
    .then(data => {
        localStorage.removeItem('access');
        console.log(translate('Account deleted!'));
    })
    .catch(error => {
        console.error('Error DeleteAccount:', error);
    });
}

document.getElementById('enable2faButton').addEventListener('click', function(event) {
    event.preventDefault();
    enableTwoFactorAuthentication();
});

function enableTwoFactorAuthentication() {
    fetch(`https://${host}/api/enable-2fa/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(translate('Error enabling 2FA'));
        }
        return response.json();
    })
    .then(data => {
        display2FASetup(data.otp_uri);
    })
    .catch((error) => {
        console.log('Error Enable2FA:', error);
    });
}

function display2FASetup(otpUri) {
    const setupContainer = document.getElementById('twoFactorSetupContainer');
    setupContainer.innerHTML = '';

    if (otpUri.startsWith('otpauth://')) {
        const qrCodeImage = document.createElement('canvas');
        setupContainer.appendChild(qrCodeImage);

        QRCode.toCanvas(qrCodeImage, otpUri, function(error) {
            if (error) console.error(error);
            console.log(translate('QRCode generated!'));
        });
    } else {
        const secretKeyElement = document.createElement('p');
        secretKeyElement.textContent = `2FA secret key: ${otpUri}`;
        setupContainer.appendChild(secretKeyElement);
    }

    const instructions = document.createElement('p');
    instructions.textContent = translate('Scan the QR Code and enter the secret key from your 2FA app. Enter the generated code to verify setup.');
    setupContainer.appendChild(instructions);

    const verificationCodeInput = document.createElement('input');
    verificationCodeInput.type = 'text';
    verificationCodeInput.placeholder = translate('Enter 2FA code');
    setupContainer.appendChild(verificationCodeInput);

    const verifyButton = document.createElement('button');
    verifyButton.textContent = translate('Verify Code');
    verifyButton.addEventListener('click', () => verifyTwoFactorCode(verificationCodeInput.value));
    setupContainer.appendChild(verifyButton);
}

function verifyTwoFactorCode(code) {
    fetch(`https://${host}/api/verify-2fa/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ '2fa_code': code })
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(translate('2FA verification failed'));
        }
        alert(translate('Two-Factor authentication setup complete!'));
    })
    .catch((error) => {
        console.log('Error Verify2FA:', error);
    });
}

function toggleChangePasswordContainer() {
    const container = document.getElementById('changePasswordContainer');
    container.style.display = (container.style.display === 'block') ? 'none' : 'block';
}

document.getElementById('changePasswordButton').addEventListener('click', function() {
    toggleChangePasswordContainer();
});

document.getElementById('changePasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    changePassword();
});

function changePassword() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const accessToken = localStorage.getItem('access');

    if (!newPassword.trim()) {
        alert(translate('New password cannot be empty!'));
        return;
    }

    // send request to server
    fetch(`https://${host}/api/change-password/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(translate('Password could not be changed!'));
        }
        return response.json();
    })
    .then(data => {
        console.log(translate('Password changed!'));
        alert(translate('Password changed successfully! Login again.'));
        document.getElementById('changePasswordForm').reset();
    })
    .catch(error => {
        console.error('Error ChangePassword:', error);
        alert(translate('Password could not be changed!'));
    });
    toggleChangePasswordContainer();
}

window.onload = function() {
    document.getElementById('changePasswordContainer').style.display = 'none';
};