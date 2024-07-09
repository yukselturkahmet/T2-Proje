document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const adminLogin = document.getElementById('adminLogin');
    const loginForm = document.getElementById('loginForm');

    loginButton.addEventListener('click', (event) => {
        event.preventDefault();

        const email = document.getElementById('inputEmail').value;
        const password = document.getElementById('inputPassword').value;

        if (validateEmail(email) && validatePassword(password)) {
            console.log('Login successful');

        } else {
            console.log('Login failed');

        }
    });

    adminLogin.addEventListener('click', () => {
        console.log('Admin login clicked');

    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        
        return password.length >= 6;
    }
});

