import appState from "./appstate.js";
import { notifyListeners } from "./appstate.js";

document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var email = document.getElementById('email_reg').value;
    var username = document.getElementById('username_reg').value;
    var password = document.getElementById('password_reg').value;

    // validate data
    if (!validateEmail(email) || !validateUsername(username)) {
        alert('Invalid email --> should be: user1@test.com\nusername --> accepted: a-z, A-Z, 0-9\npassword rules --> at least 6 characters, not same as username, not all numeric, not common');
        return;
    }

    var data = {
        email: email,
        username: username,
        password: password
    };

    const agreement = confirm('By clicking OK you agree to the Terms of Use.');
    if (!agreement) {
        alert('Regsitration canceled!')
        return;
    }

    // send data to backend
    fetch(`https://${host}/api/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success!');
        alert('Registration successful!');
        document.getElementById('registrationForm').reset();
        appState.isLoggedIn = true;
        appState.userProfile = data;
        notifyListeners();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validateUsername(username) {
    var re = /^[a-zA-Z0-9_-]+$/;
    return re.test(String(username));
}