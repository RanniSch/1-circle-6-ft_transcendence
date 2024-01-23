document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var email = document.getElementById('email_login').value;
    var password = document.getElementById('password_login').value;

    var data = {
        email: email,
        password: password
    };

    fetch('https://localhost/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid username or password');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        localStorage.setItem('access', data.access);

        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registrationForm').style.display = 'none';
        loadProfile();

    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// checkbox show password
document.getElementById('togglePasswordLogin').addEventListener('change', function(event) {
    const passwordInput = document.getElementById('password_login');
    if (event.target.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});

function loadProfile() {
    const access = localStorage.getItem('access');
    fetch('https://localhost//api/profile/', {
        headers: {
            'Authorization': 'Bearer ' + access 
        }
    })
    .then(response => {
        if (!response.ok) {
            document.getElementById('loginForm').reset();
            throw new Error('Not authorized');
        }
        return response.json();
    })
    .then(profileData => {
        console.log(profileData);
        displayUserProfile(profileData);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}