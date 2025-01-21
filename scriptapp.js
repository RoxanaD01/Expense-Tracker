const expenseList = document.getElementById('expenseList');
const expenseModal = document.getElementById('expenseModal');

const appListeners = () => {
    const addButton = document.getElementById('add-button');
    const closeButton = document.getElementById('closeModal');
    const expenseForm = document.getElementById('expenseForm');

    addButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    expenseForm.addEventListener('submit', saveExpense);

    // Initial display of expenses and chart
    displayExpenses();
    delayDisplayChart();
}

const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Storage set error:", error);
            alert("Data may not be saved properly.");
        }
    },
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error("Storage get error:", error);
            alert("Data could not be loaded.");
            return null;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Storage remove error:", error);
            alert("Data could not be deleted.");
        }
    },
    available: () => {
        try {
            localStorage.setItem("test_key", "test_key");
            localStorage.removeItem("test_key");
            return true;
        } catch {
            alert("Local storage is unavailable; data will only persist in this session.");
            return false;
        }
    }
};

const expenses = storage.available() ? storage.get('expenses') || [] : []; 
let editingIndex = null;

// User clicks "Add Expense" and the modal opens
const openModal = () => {
    document.getElementById('modalTitle').innerText = 'Add Expense';
    expenseForm.reset();
    editingIndex = null;
    expenseModal.style.display = 'block';
}

const closeModal = () => {
    expenseModal.style.display = 'none';
}

//Handles form submission.
const saveExpense = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const categorySelect = document.getElementById('categorySelect');
    const categoryOther = document.getElementById('categoryOther');
    const currency = document.getElementById('currency').value;
    const errorMessage = document.getElementById('errorMessage');

    const category = categorySelect.value === 'Other' ? categoryOther.value : categorySelect.value;

    // Reset the error message
    errorMessage.style.display = 'none';
    errorMessage.innerText = '';

    // Amount Validation: the amount should be a positive number
    if (isNaN(amount) || amount <= 0) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = "Please enter a positive amount.";
        return;
    }

     // Date Validation: Ensure the date is not in the future
     const selectedDate = new Date(date);
     const today = new Date();
     if (selectedDate > today) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = "The date cannot be in the future.";
         return;
     }
 
    const expenseData = { amount, currency, category, date, description };

    if (editingIndex !== null) {
        expenses[editingIndex] = expenseData;
    } else {
        expenses.push(expenseData);
    }

    storage.set('expenses', expenses);

    closeModal();
    errorMessage.style.display = 'none'; // Hide error message on successful save
    displayExpenses();
    delayDisplayChart();
}

//Display the list of expenses.
const displayExpenses = () => {
    expenseList.innerHTML = '';

    // Displays a message when no expenses are recorded.
    if(expenses.length === 0) {
        expenseList.innerHTML = '<p>No expenses recorded. Add your first expense!</p>';
        return;
    }

    expenses.forEach((expense, index) => {
        const expenseItem = document.createElement('div');
        expenseItem.innerHTML = `
            ${expense.category} - <strong>${expense.amount} ${expense.currency}</strong>  
            <p>${expense.date}</p>
            <p>${expense.description}</p>
            <button onclick="editExpense(${index})" class="edit-button" aria-label="edit button">Edit</button>
            <button onclick="deleteExpense(${index})" class="delete-button" aria-label="delete button">Delete</button>
        `;
        expenseList.appendChild(expenseItem);
    });

    totalExpenses();
    monthlyExpenses();
    delayDisplayChart();
}

const editExpense = (index) => {
    editingIndex = index;
    const expense = expenses[index];
    document.getElementById('modalTitle').innerText = 'Edit Expense';
    document.getElementById('amount').value = expense.amount;
    document.getElementById('categorySelect').value = expense.category;
    document.getElementById('categoryOther').value = expense.category;
    document.getElementById('date').value = expense.date;
    document.getElementById('description').value = expense.description;
    expenseModal.style.display = 'block';
}

const deleteExpense = (index) => {
    expenses.splice(index, 1);
    storage.set('expenses', expenses);;
    displayExpenses();
    delayDisplayChart();
}

const totalExpenses = () => {
     // Group totals by currency
     const total = expenses.reduce((acc, expense) => {
        if (!acc[expense.currency]) {
            acc[expense.currency] = 0;
        }
        acc[expense.currency] += parseFloat(expense.amount);
        return acc;
    }, {});

    const totalExpense = document.getElementById('total');
    totalExpense.innerHTML = ''; // Clear previous totals

    // Display each currency total
    Object.entries(total).forEach(([currency, total]) => {
        const currencyTotal = document.createElement('p');
        currencyTotal.textContent = `${currency}: ${total}`;
        totalExpense.appendChild(currencyTotal);
    });
}

const monthlyExpenses = () => {
    const monthly = expenses.reduce((acc, expense) => {
        const date = new Date(expense.date);
        const month = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
        const currency = expense.currency;

        // Initialize if the month or currency doesn't exist
        if (!acc[month]) {
            acc[month] = {};
        }
        if (!acc[month][currency]) {
            acc[month][currency] = 0;
        }

        // Add to the total for the month and currency
        acc[month][currency] += parseFloat(expense.amount);
        return acc;
    }, {});

    const monthlyExpense= document.getElementById('monthlyTotal');
    monthlyExpense.innerHTML = '<h3>Monthly Expenses</h3>'; // Clear previous content

    // Display each month's expenses by currency
    Object.entries(monthly).forEach(([month, currencyTotals]) => {
        const monthElement = document.createElement('div');
        monthElement.innerHTML = `<strong>${month}</strong>`;

        Object.entries(currencyTotals).forEach(([currency, total]) => {
            const currencyTotal = document.createElement('p');
            currencyTotal.textContent = `${currency}: ${total}`;
            monthElement.appendChild(currencyTotal);
        });

        monthlyExpense.appendChild(monthElement);
    });
};

const categorySwitch = () => {
    if (categorySelect.value === 'Other') {
        categoryOther.style.display = 'block';  
        categoryOther.required = true;          
    } else {
        categoryOther.style.display = 'none'; 
        categoryOther.required = false;        
        categoryOther.value = '';     
}
}

categorySelect.addEventListener('change', categorySwitch);

// PIE Chart with Chart.js

let pieChart;
const ctx = document.getElementById('pieChart').getContext('2d');

const chartData = () => {
    return {
        data: expenses.map(expense => parseFloat(expense.amount)),
        labels: expenses.map(expense => expense.category),
        colors: ['#D81E5B', '#FFA62B', '#FF5900', '#009FFD', '#7209B7', '#550C18', '#F9DC5C', '#E3B505', '#3B28CC', '#90A959', '#885A89', '#688E26', '#F2ED6F', '#322A26', '#F2BAC9' ] 
    };
};

const displayChart = () => {
    const { data, labels, colors } = chartData();

    // Destroy previous chart instance if it exists
    if (pieChart) {
        pieChart.destroy();
    }

    if (data.length > 0) {
        pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels, 
                datasets: [{
                    data: data, // Data values, e.g., 500, 200
                    backgroundColor: colors,
                }]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false, 
                width: 300,                   
                height: 300,                  
                interaction: {
                    mode: 'nearest', // Focuses on the nearest point for hover events
                    intersect: true   // Ensures only points under the cursor trigger tooltips
                },
                plugins: {
                    legend: { 
                        position: 'top',
                        labels: {
                            color: '#333', 
                            font: { size: 14 } 
                        }
                    },
                    tooltip: { // Displays category labels with the amount in a clean format.
                        bodyFont: {
                            size: 16 
                        },
                        titleFont: {
                            size: 18 
                        },
                        callbacks: {
                            label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`
                        }
                    }
                }
            }
        });
    } else {
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('No expenses to show', canvas.width / 2 - 40, canvas.height / 2);
    }
};

const delayChart = (f) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => f.apply(this, args), 300);
    };
}

const delayDisplayChart = delayChart(displayChart, 300);
document.addEventListener('DOMContentLoaded', appListeners);
