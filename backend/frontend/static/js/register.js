document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var email = document.getElementById('email_reg').value;
    var username = document.getElementById('username_reg').value;
    var password = document.getElementById('password_reg').value;

    // validate data
    if (!validateEmail(email) || !validateUsername(username)) {
        alert('Invalid email or username');
        return;
    }

    var data = {
        email: email,
        username: username,
        password: password
    };

    // send data to backend
    fetch('https://10.12.14.3/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success!');
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