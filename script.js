const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const transactionType = document.getElementsByName("transaction-type");

// Initialize transactions array from local storage
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorageTransactions || [];

// Add Transaction
function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Please add text and amount');
    } else if (isNaN(amount.value)) {
        alert('Please enter a valid number for the amount');
    } else {
        const selectedType = Array.from(transactionType).find(radio => radio.checked).value;
        const sign = selectedType === 'expense' ? -1 : 1;
        const transaction = {
            id: generateID(),
            text: text.value,
            amount: sign * parseFloat(amount.value)
        };

        transactions.push(transaction);

        addTransactionDOM(transaction);
        updateValues();
        updateLocalStorage();
        createPieChart();

        text.value = '';
        amount.value = '';
    }
}

// Remove Transaction by ID
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

// Generate Random ID
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// Add Transactions to DOM list
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');

    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    item.innerHTML = `
        ${transaction.text} <span>${sign} Rs${Math.abs(transaction.amount)}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;
    list.appendChild(item);
}

// Update the balance, income, and expense
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    const expense = (amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1)
        .toFixed(2);

    balance.innerText = `Rs${total}`;
    money_plus.innerText = `Rs${income}`;
    money_minus.innerText = `Rs${expense}`;
}

// Update local storage transactions
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Initialize the application
function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    createPieChart();
}

// Create Pie Chart
let myChart;

function createPieChart() {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    const income = transactions.filter(transaction => transaction.amount > 0)
                              .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0);
    const expense = transactions.filter(transaction => transaction.amount < 0)
                               .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0);

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                label: 'Transactions',
                data: [income, expense],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            radius: '70%',
           // coutout:'80%',
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': Rs' + tooltipItem.raw;
                        }
                    }
                }
            }
            
        }
    });
}

form.addEventListener('submit', addTransaction);

init();
