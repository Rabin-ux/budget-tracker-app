document.addEventListener('DOMContentLoaded', () => {
    const userId = sessionStorage.getItem('userId');
    // If no userId is found, redirect to login page
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    const balanceEl = document.getElementById('balance');
    const transactionListEl = document.getElementById('transaction-list');
    const transactionForm = document.getElementById('transaction-form');
    const logoutBtn = document.getElementById('logout-btn');

    // --- This is a new function, but it's the same code as before ---
    async function fetchTransactions() {
        const res = await fetch(`http://localhost:3000/transactions?userId=${userId}`);
        const transactions = await res.json();
        
        // Clear old list
        transactionListEl.innerHTML = '';
        
        let balance = 0;
        transactions.forEach(t => {
            if (t.type === 'income') {
                balance += t.amount;
            } else {
                balance -= t.amount;
            }

            const li = document.createElement('li');
            li.innerHTML = `${t.description} <span class="${t.type}">₹${t.amount.toFixed(2)}</span>`;
            transactionListEl.appendChild(li);
        });

        balanceEl.textContent = `₹${balance.toFixed(2)}`;
    }
    // -----------------------------------------------------------------

    // Fetch and display transactions on page load
    fetchTransactions();

    // Event listener for adding a new transaction
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        const type = document.querySelector('input[name="type"]:checked').value;

        if (!description || !amount) {
            alert('Please fill in all fields');
            return;
        }

        // =========================================================
        // THIS IS THE PART THAT IS NOW FIXED
        // =========================================================
        const response = await fetch('http://localhost:3000/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                description,
                amount: parseFloat(amount), // Using parseFloat to ensure it's a number
                type, // This was missing
            }),     // This was missing
        });         // This was missing
        // =========================================================

        if (response.ok) {
            transactionForm.reset();
            fetchTransactions(); // Refresh the list
        } else {
            alert('Failed to add transaction.');
        }
    });

    // Event listener for the logout button
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('userId');
        window.location.href = 'login.html';
    });
});