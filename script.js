// FinanceFlow - JavaScript vanilla para controle financeiro

// Data Storage
let transactions = JSON.parse(localStorage.getItem('financeflow_transactions')) || [];
let categories = JSON.parse(localStorage.getItem('financeflow_categories')) || [
    { id: '1', name: 'Alimentação', icon: '🍔', color: '#ef4444' },
    { id: '2', name: 'Transporte', icon: '🚗', color: '#3b82f6' },
    { id: '3', name: 'Lazer', icon: '🎬', color: '#8b5cf6' },
    { id: '4', name: 'Saúde', icon: '💊', color: '#22c55e' },
    { id: '5', name: 'Educação', icon: '🎓', color: '#f59e0b' }
];
let goals = JSON.parse(localStorage.getItem('financeflow_goals')) || [];
let currentTheme = localStorage.getItem('financeflow_theme') || 'light';

// Charts
let expenseChart = null;
let monthlyChart = null;

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

function saveToStorage() {
    localStorage.setItem('financeflow_transactions', JSON.stringify(transactions));
    localStorage.setItem('financeflow_categories', JSON.stringify(categories));
    localStorage.setItem('financeflow_goals', JSON.stringify(goals));
}

// Theme Functions
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButtons();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('financeflow_theme', currentTheme);
    updateThemeButtons();
}

function updateThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-toggle');
    const icon = currentTheme === 'light' ? '🌙' : '☀️';
    themeButtons.forEach(btn => btn.textContent = icon);
}

// Navigation Functions
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Add active class to nav item
    const navItem = document.querySelector(`[href="#${pageId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Close mobile menu
    document.querySelector('.sidebar').classList.remove('open');
    
    // Update page content
    switch(pageId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'transactions':
            updateTransactionsList();
            break;
        case 'categories':
            updateCategoriesList();
            break;
        case 'goals':
            updateGoalsList();
            break;
        case 'reports':
            updateReports();
            break;
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset forms
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function openTransactionModal(type = '') {
    openModal('transaction-modal');
    
    if (type) {
        document.getElementById('transaction-type').value = type;
        updateTransactionModalTitle();
    }
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    
    updateCategoriesDropdown();
}

function openCategoryModal() {
    openModal('category-modal');
}

function openGoalModal() {
    openModal('goal-modal');
}

function updateTransactionModalTitle() {
    const type = document.getElementById('transaction-type').value;
    const title = document.getElementById('transaction-modal-title');
    
    if (type === 'income') {
        title.textContent = 'Adicionar Receita';
    } else if (type === 'expense') {
        title.textContent = 'Adicionar Despesa';
    } else {
        title.textContent = 'Adicionar Transação';
    }
}

// Transaction Functions
function addTransaction(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const transaction = {
        id: generateId(),
        type: document.getElementById('transaction-type').value,
        description: document.getElementById('transaction-description').value,
        amount: parseFloat(document.getElementById('transaction-amount').value),
        categoryId: document.getElementById('transaction-category').value,
        date: document.getElementById('transaction-date').value,
        createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveToStorage();
    closeModal('transaction-modal');
    
    // Update current page
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        showPage(activePage.id);
    }
}

function deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveToStorage();
        updateTransactionsList();
        updateDashboard();
    }
}

function updateTransactionsList() {
    const container = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma transação encontrada</p>';
        return;
    }
    
    // Apply filters
    const typeFilter = document.getElementById('type-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    
    let filteredTransactions = transactions;
    
    if (typeFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    if (categoryFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.categoryId === categoryFilter);
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = filteredTransactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        const amountClass = transaction.type === 'income' ? 'amount-income' : 'amount-expense';
        const sign = transaction.type === 'income' ? '+' : '-';
        
        return `
            <div class="transaction-item" data-testid="transaction-item-${transaction.id}">
                <div class="transaction-info">
                    <h4>${transaction.description}</h4>
                    <p>${category ? category.icon + ' ' + category.name : 'Sem categoria'} • ${formatDate(transaction.date)}</p>
                </div>
                <div>
                    <div class="transaction-amount ${amountClass}">
                        ${sign}${formatCurrency(transaction.amount)}
                    </div>
                    <button onclick="deleteTransaction('${transaction.id}')" 
                            style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-top: 0.5rem;"
                            data-testid="button-delete-transaction-${transaction.id}">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Category Functions
function addCategory(e) {
    e.preventDefault();
    
    const category = {
        id: generateId(),
        name: document.getElementById('category-name').value,
        icon: document.getElementById('category-icon').value,
        color: document.getElementById('category-color').value
    };
    
    categories.push(category);
    saveToStorage();
    closeModal('category-modal');
    updateCategoriesList();
    updateCategoriesDropdown();
}

function deleteCategory(id) {
    // Check if category is being used
    const isUsed = transactions.some(t => t.categoryId === id);
    
    if (isUsed) {
        alert('Esta categoria não pode ser excluída pois está sendo usada em transações.');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        categories = categories.filter(c => c.id !== id);
        saveToStorage();
        updateCategoriesList();
        updateCategoriesDropdown();
    }
}

function updateCategoriesList() {
    const container = document.getElementById('categories-list');
    
    if (categories.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma categoria encontrada</p>';
        return;
    }
    
    container.innerHTML = categories.map(category => {
        const usageCount = transactions.filter(t => t.categoryId === category.id).length;
        
        return `
            <div class="category-item" data-testid="category-item-${category.id}">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 2rem;">${category.icon}</span>
                    <div>
                        <h4>${category.name}</h4>
                        <p style="color: var(--text-secondary);">${usageCount} transação(ões)</p>
                    </div>
                </div>
                <button onclick="deleteCategory('${category.id}')" 
                        style="background: none; border: none; color: var(--text-secondary); cursor: pointer;"
                        data-testid="button-delete-category-${category.id}">
                    🗑️ Excluir
                </button>
            </div>
        `;
    }).join('');
}

function updateCategoriesDropdown() {
    const selects = [
        document.getElementById('transaction-category'),
        document.getElementById('category-filter')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        
        const isFilter = select.id === 'category-filter';
        const currentValue = select.value;
        
        let options = isFilter ? '<option value="">Todas as categorias</option>' : '<option value="">Selecione a categoria</option>';
        
        options += categories.map(category => 
            `<option value="${category.id}">${category.icon} ${category.name}</option>`
        ).join('');
        
        select.innerHTML = options;
        select.value = currentValue;
    });
}

// Goal Functions
function addGoal(e) {
    e.preventDefault();
    
    const goal = {
        id: generateId(),
        name: document.getElementById('goal-name').value,
        targetAmount: parseFloat(document.getElementById('goal-target').value),
        currentAmount: parseFloat(document.getElementById('goal-current').value) || 0,
        deadline: document.getElementById('goal-deadline').value,
        createdAt: new Date().toISOString()
    };
    
    goals.push(goal);
    saveToStorage();
    closeModal('goal-modal');
    updateGoalsList();
}

function deleteGoal(id) {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
        goals = goals.filter(g => g.id !== id);
        saveToStorage();
        updateGoalsList();
    }
}

function updateGoalProgress(id, amount) {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.currentAmount = Math.max(0, Math.min(goal.targetAmount, amount));
        saveToStorage();
        updateGoalsList();
    }
}

function updateGoalsList() {
    const container = document.getElementById('goals-list');
    
    if (goals.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma meta encontrada</p>';
        return;
    }
    
    container.innerHTML = goals.map(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const isCompleted = progress >= 100;
        const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        
        return `
            <div class="goal-item" data-testid="goal-item-${goal.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h4>${goal.name}</h4>
                        <p style="color: var(--text-secondary);">
                            ${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}
                            ${daysLeft !== null ? ` • ${daysLeft > 0 ? daysLeft + ' dias restantes' : 'Vencida'}` : ''}
                        </p>
                    </div>
                    <button onclick="deleteGoal('${goal.id}')" 
                            style="background: none; border: none; color: var(--text-secondary); cursor: pointer;"
                            data-testid="button-delete-goal-${goal.id}">
                        🗑️ Excluir
                    </button>
                </div>
                
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="progress-text">
                        ${progress.toFixed(1)}% concluído ${isCompleted ? '🎉' : ''}
                    </div>
                </div>
                
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <input type="number" 
                           placeholder="Adicionar valor" 
                           id="goal-input-${goal.id}" 
                           step="0.01"
                           style="flex: 1; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary);"
                           data-testid="input-goal-amount-${goal.id}">
                    <button onclick="addToGoal('${goal.id}')" 
                            style="padding: 0.5rem 1rem; background: var(--gradient-success); color: white; border: none; border-radius: 6px; cursor: pointer;"
                            data-testid="button-add-to-goal-${goal.id}">
                        Adicionar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function addToGoal(goalId) {
    const input = document.getElementById(`goal-input-${goalId}`);
    const amount = parseFloat(input.value);
    
    if (amount && amount > 0) {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
            saveToStorage();
            updateGoalsList();
            input.value = '';
        }
    }
}

// Dashboard Functions
function updateDashboard() {
    updateFinancialCards();
    updateCharts();
    updateRecentTransactions();
}

function updateFinancialCards() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate totals
    let totalBalance = 0;
    let monthIncome = 0;
    let monthExpenses = 0;
    
    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const amount = transaction.amount;
        
        if (transaction.type === 'income') {
            totalBalance += amount;
            if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
                monthIncome += amount;
            }
        } else {
            totalBalance -= amount;
            if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
                monthExpenses += amount;
            }
        }
    });
    
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    
    // Update UI
    document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
    document.getElementById('month-income').textContent = formatCurrency(monthIncome);
    document.getElementById('month-expenses').textContent = formatCurrency(monthExpenses);
    document.getElementById('total-savings').textContent = formatCurrency(totalSavings);
}

function updateCharts() {
    updateExpenseChart();
    updateMonthlyChart();
}

function updateExpenseChart() {
    const canvas = document.getElementById('expenseChart');
    const ctx = canvas.getContext('2d');
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    // Calculate expenses by category
    const expensesByCategory = {};
    
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            const category = categories.find(c => c.id === transaction.categoryId);
            const categoryName = category ? category.name : 'Sem categoria';
            
            if (!expensesByCategory[categoryName]) {
                expensesByCategory[categoryName] = {
                    amount: 0,
                    color: category ? category.color : '#64748b'
                };
            }
            
            expensesByCategory[categoryName].amount += transaction.amount;
        }
    });
    
    const labels = Object.keys(expensesByCategory);
    const data = labels.map(label => expensesByCategory[label].amount);
    const colors = labels.map(label => expensesByCategory[label].color);
    
    if (labels.length === 0) {
        canvas.style.display = 'none';
        return;
    }
    
    canvas.style.display = 'block';
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        }
    });
}

function updateMonthlyChart() {
    const canvas = document.getElementById('monthlyChart');
    const ctx = canvas.getContext('2d');
    
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    // Calculate monthly data for last 6 months
    const monthlyData = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = { income: 0, expenses: 0 };
    }
    
    // Aggregate transaction data
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[key]) {
            if (transaction.type === 'income') {
                monthlyData[key].income += transaction.amount;
            } else {
                monthlyData[key].expenses += transaction.amount;
            }
        }
    });
    
    const labels = Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    });
    
    const incomeData = Object.values(monthlyData).map(data => data.income);
    const expenseData = Object.values(monthlyData).map(data => data.expenses);
    
    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomeData,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Despesas',
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                }
            }
        }
    });
}

function updateRecentTransactions() {
    const container = document.getElementById('recent-list');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma transação encontrada</p>';
        return;
    }
    
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    container.innerHTML = recentTransactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        const amountClass = transaction.type === 'income' ? 'amount-income' : 'amount-expense';
        const sign = transaction.type === 'income' ? '+' : '-';
        
        return `
            <div class="transaction-item" data-testid="recent-transaction-${transaction.id}">
                <div class="transaction-info">
                    <h4>${transaction.description}</h4>
                    <p>${category ? category.icon + ' ' + category.name : 'Sem categoria'} • ${formatDate(transaction.date)}</p>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${sign}${formatCurrency(transaction.amount)}
                </div>
            </div>
        `;
    }).join('');
}

// Reports Functions
function updateReports() {
    updateFinancialSummary();
    updateTopCategories();
}

function updateFinancialSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    document.getElementById('report-income').textContent = formatCurrency(totalIncome);
    document.getElementById('report-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('report-balance').textContent = formatCurrency(balance);
}

function updateTopCategories() {
    const container = document.getElementById('top-categories');
    
    // Calculate spending by category
    const categorySpending = {};
    
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            const category = categories.find(c => c.id === transaction.categoryId);
            const categoryName = category ? category.name : 'Sem categoria';
            
            if (!categorySpending[categoryName]) {
                categorySpending[categoryName] = {
                    amount: 0,
                    count: 0,
                    icon: category ? category.icon : '❓'
                };
            }
            
            categorySpending[categoryName].amount += transaction.amount;
            categorySpending[categoryName].count += 1;
        }
    });
    
    const sortedCategories = Object.entries(categorySpending)
        .sort(([,a], [,b]) => b.amount - a.amount)
        .slice(0, 5);
    
    if (sortedCategories.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma transação encontrada</p>';
        return;
    }
    
    container.innerHTML = sortedCategories.map(([name, data]) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.5rem;">${data.icon}</span>
                <div>
                    <div style="font-weight: 600;">${name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">${data.count} transação(ões)</div>
                </div>
            </div>
            <div style="font-weight: 700; color: #ef4444;">
                ${formatCurrency(data.amount)}
            </div>
        </div>
    `).join('');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('href').substring(1);
            showPage(pageId);
        });
    });
    
    // Forms
    document.getElementById('transaction-form').addEventListener('submit', addTransaction);
    document.getElementById('category-form').addEventListener('submit', addCategory);
    document.getElementById('goal-form').addEventListener('submit', addGoal);
    
    // Transaction type change
    document.getElementById('transaction-type').addEventListener('change', updateTransactionModalTitle);
    
    // Filters
    document.getElementById('type-filter').addEventListener('change', updateTransactionsList);
    document.getElementById('category-filter').addEventListener('change', updateTransactionsList);
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Initialize data
    updateCategoriesDropdown();
    
    // Show dashboard by default
    showPage('dashboard');
});

// Global functions for HTML onclick handlers
window.showPage = showPage;
window.openModal = openModal;
window.closeModal = closeModal;
window.openTransactionModal = openTransactionModal;
window.openCategoryModal = openCategoryModal;
window.openGoalModal = openGoalModal;
window.deleteTransaction = deleteTransaction;
window.deleteCategory = deleteCategory;
window.deleteGoal = deleteGoal;
window.addToGoal = addToGoal;
window.toggleTheme = toggleTheme;