document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('message');

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.status === 201) {
            messageEl.textContent = 'Registration successful! Redirecting to login...';
            messageEl.style.color = 'green';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            messageEl.textContent = data.message || 'Registration failed.';
            messageEl.style.color = 'red';
        }
    } catch (error) {
        messageEl.textContent = 'An error occurred. Please try again.';
        messageEl.style.color = 'red';
    }
});