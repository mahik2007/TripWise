/**
 * TripWise - Smart Travel Expense Splitting Web Application
 * Unified Frontend Logic & Backend API Integration
 */

// â”€â”€â”€ CONFIGURATION & HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getApiBaseUrl() {
    if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '8000'
    ) {
        return `${window.location.protocol}//${window.location.hostname}:8000`;
    }

    return 'https://tripwise-backend-two.vercel.app';
}

const API_BASE_URL = getApiBaseUrl();

// â”€â”€â”€ THEME MANAGEMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getStoredTheme() {
    return localStorage.getItem('tripwise_theme') || 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tripwise_theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.innerHTML = theme === 'dark'
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
        btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
}

function toggleTheme() {
    const current = getStoredTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

function injectThemeButton() {
    // Inject theme toggle button into the navbar next to menu-btn
    const nav = document.querySelector('nav');
    if (!nav || document.getElementById('theme-toggle')) return;

    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.title = 'Toggle Dark/Light Mode';
    btn.onclick = toggleTheme;
    btn.innerHTML = getStoredTheme() === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';

    // Insert before .menu-btn or at end of nav
    const menuBtn = nav.querySelector('.menu-btn');
    if (menuBtn) {
        nav.insertBefore(btn, menuBtn);
    } else {
        nav.appendChild(btn);
    }
}


// User session management
function getCurrentUser() {
    try {
        const u = localStorage.getItem('tripwise_user');
        return u ? JSON.parse(u) : null;
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    localStorage.setItem('tripwise_user', JSON.stringify(user));
    updateAuthUI();
}

function logoutUser() {
    localStorage.removeItem('tripwise_user');
    showNotification('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

// Active Trip management
function getActiveTrip() {
    try {
        const t = localStorage.getItem('current_trip');
        return t ? JSON.parse(t) : null;
    } catch (e) {
        return null;
    }
}

function setActiveTrip(trip) {
    localStorage.setItem('current_trip', JSON.stringify(trip));
}

// Notification Toast
function showNotification(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 85px;
            right: 25px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isErr = type === 'error';
    toast.style.cssText = `
        background: ${isErr ? '#ef4444' : '#14532d'};
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 260px;
        animation: toastSlideIn 0.3s ease-out;
    `;
    toast.innerHTML = `<i class="fa-solid ${isErr ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// â”€â”€â”€ GLOBAL UI & AUTH STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function updateAuthUI() {
    const user = getCurrentUser();
    const profileLinks = document.querySelectorAll('.nav-links a[href*="create_acc"], .nav-links a[href*="login"], .sidebar a[href*="create_acc"], .sidebar a[href*="login"]');
    
    profileLinks.forEach(link => {
        if (user) {
            link.innerHTML = `<i class="fa-solid fa-user-check"></i> ${user.name.split(' ')[0]} (Logout)`;
            link.href = "#";
            link.onclick = (e) => {
                e.preventDefault();
                if (confirm(`Logged in as ${user.name} (${user.email}). Do you want to logout?`)) {
                    logoutUser();
                }
            };
        } else {
            link.innerHTML = `<i class="fa-solid fa-circle-user"></i> Login / Profile`;
            link.href = "login.html";
            link.onclick = null;
        }
    });
}

function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("active");
}

function toggleSidebar() {
    openSidebar();
}

// â”€â”€â”€ UNIVERSAL AI CHATBOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function toggleChat() {
    const chatWin = document.getElementById('chat-window');
    if (chatWin) {
        chatWin.classList.toggle('open');
        const input = document.getElementById('chat-input');
        if (chatWin.classList.contains('open') && input) {
            setTimeout(() => input.focus(), 150);
        }
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    if (!input || !messages) return;

    const userText = input.value.trim();
    if (!userText) return;

    // Append user message
    const userBubble = document.createElement('div');
    userBubble.className = 'user-msg';
    userBubble.textContent = userText;
    messages.appendChild(userBubble);
    input.value = '';

    // Thinking indicator
    const thinking = document.createElement('div');
    thinking.className = 'thinking-msg';
    thinking.id = 'chat-thinking-indicator';
    thinking.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> TripWise AI is thinking...`;
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

    try {
        const response = await fetch(`${API_BASE_URL}/api/chatbot/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });

        const data = await response.json();
        const indicator = document.getElementById('chat-thinking-indicator');
        if (indicator) indicator.remove();

        const botBubble = document.createElement('div');
        botBubble.className = 'bot-msg';
        botBubble.innerHTML = (data.reply || "I'm ready to assist with your travel expenses!").replace(/\n/g, '<br>');
        messages.appendChild(botBubble);
    } catch (err) {
        const indicator = document.getElementById('chat-thinking-indicator');
        if (indicator) indicator.remove();

        const botBubble = document.createElement('div');
        botBubble.className = 'bot-msg';
        botBubble.textContent = "👋 I'm having a little trouble connecting right now, but feel free to check out the Create Trip and Expenses tabs to start budgeting!";
        messages.appendChild(botBubble);
    }
    messages.scrollTop = messages.scrollHeight;
}

// â”€â”€â”€ PAGE-SPECIFIC INITIALIZATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

document.addEventListener('DOMContentLoaded', () => {
    // Apply stored theme immediately
    applyTheme(getStoredTheme());
    // Inject theme toggle button into navbar
    injectThemeButton();

    updateAuthUI();

    // 1. SIGNUP PAGE (create_acc.html)
    initSignupPage();

    // 2. LOGIN PAGE (login.html)
    initLoginPage();

    // 3. FORGOT PASSWORD (forgotpasslogin.html)
    initForgotPassPage();

    // 4. CREATE TRIP PAGE (create_trip.html)
    initCreateTripPage();

    // 5. ADD EXPENSE PAGE (add_expense.html)
    initAddExpensePage();

    // 6. SUMMARY PAGE (summary.html)
    initSummaryPage();

    // 7. CONTACT PAGE (contact.html)
    initContactPage();
});


// â”€â”€â”€ 1. SIGNUP PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function initSignupPage() {
    const signupForm = document.querySelector('.create-account form');
    if (!signupForm) return;

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = signupForm.querySelector('input[name="name"]') || document.getElementById('name');
        const emailInput = signupForm.querySelector('input[name="email"]') || document.getElementById('email');
        const passInput = signupForm.querySelector('input[name="password"]') || document.getElementById('password');

        if (!nameInput || !emailInput || !passInput) return;

        const payload = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passInput.value
        };

        const submitBtn = signupForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/signup/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                showNotification(data.error || 'Signup failed', 'error');
            } else {
                showNotification('Account created successfully! Redirecting...', 'success');
                setCurrentUser(data.user);
                setTimeout(() => {
                    window.location.href = 'create_trip.html';
                }, 1000);
            }
        } catch (err) {
            showNotification('Server connection error. Please ensure backend is running.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        }
    });
}

// â”€â”€â”€ 2. LOGIN PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function initLoginPage() {
    const loginForm = document.querySelector('.login-card form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = loginForm.querySelector('input[type="text"], input[type="email"]');
        const passInput = loginForm.querySelector('input[type="password"]');

        if (!emailInput || !passInput) return;

        const payload = {
            email: emailInput.value.trim(),
            password: passInput.value
        };

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging In...';
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                showNotification(data.error || 'Invalid credentials', 'error');
            } else {
                showNotification(`Welcome back, ${data.user.name}!`, 'success');
                setCurrentUser(data.user);
                setTimeout(() => {
                    window.location.href = 'create_trip.html';
                }, 800);
            }
        } catch (err) {
            showNotification('Server connection error. Please ensure backend is running.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        }
    });
}

// â”€â”€â”€ 3. FORGOT PASSWORD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function initForgotPassPage() {
    const form = document.querySelector('.forgot-card form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        const passInputs = form.querySelectorAll('input[type="password"]');

        if (!emailInput) {
            showNotification('Please enter your account email', 'error');
            return;
        }

        const newPass = passInputs[0] ? passInputs[0].value : '';
        const confirmPass = passInputs[1] ? passInputs[1].value : '';

        if (newPass !== confirmPass) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/forgot-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value.trim(), new_password: newPass })
            });
            const data = await res.json();

            if (!res.ok) {
                showNotification(data.error || 'Password reset failed', 'error');
            } else {
                showNotification('Password reset successfully! Please login.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1200);
            }
        } catch (err) {
            showNotification('Server error resetting password', 'error');
        }
    });
}

// â”€â”€â”€ 4. CREATE TRIP PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function initCreateTripPage() {
    const tripCard = document.querySelector('.trip-card');
    if (!tripCard) return;

    const form = tripCard.querySelector('form');
    if (!form) return;

    const membersInput = form.querySelector('input[type="number"]');
    
    // Create dynamic member names container inside form if not present
    let membersContainer = document.getElementById('dynamicMembersList');
    if (!membersContainer) {
        membersContainer = document.createElement('div');
        membersContainer.id = 'dynamicMembersList';
        membersContainer.style.margin = '15px 0 25px 0';
        
        // Insert right after the number of members field
        const memberCountField = membersInput ? membersInput.closest('.field') || membersInput.parentElement : null;
        if (memberCountField) {
            memberCountField.parentElement.insertAdjacentElement('afterend', membersContainer);
        } else {
            form.appendChild(membersContainer);
        }
    }

    function renderMemberFields(count) {
        membersContainer.innerHTML = '';
        if (count <= 0) return;

        const heading = document.createElement('h4');
        heading.textContent = 'Member Names:';
        heading.style.cssText = 'color:#14532d; margin-bottom:10px; font-size:16px; font-weight:600;';
        membersContainer.appendChild(heading);

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;';

        const currentUser = getCurrentUser();

        for (let i = 1; i <= count; i++) {
            const div = document.createElement('div');
            const placeholder = (i === 1 && currentUser) ? currentUser.name : `Member ${i} Name`;
            div.innerHTML = `
                <label style="font-size:13px; color:#4b5563; display:block; margin-bottom:4px;">Member ${i}:</label>
                <input type="text" class="trip-member-input" value="${(i === 1 && currentUser) ? currentUser.name : ''}" placeholder="${placeholder}" required style="width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:8px; outline:none;">
            `;
            grid.appendChild(div);
        }
        membersContainer.appendChild(grid);
    }

    if (membersInput) {
        membersInput.addEventListener('input', (e) => {
            const count = parseInt(e.target.value) || 0;
            if (count > 0 && count <= 25) {
                renderMemberFields(count);
            }
        });

        // Initialize with default 3 members
        if (!membersInput.value) {
            membersInput.value = 3;
            renderMemberFields(3);
        } else {
            renderMemberFields(parseInt(membersInput.value) || 3);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const destInput = form.querySelector('input[placeholder*="destination"]');
        const nameInput = form.querySelector('input[placeholder*="Trip Name"], input[placeholder*="Goa Friends Trip"]');
        const durationInput = form.querySelector('input[placeholder*="Days"]');
        const budgetInput = form.querySelector('input[placeholder*="Budget"], input[placeholder*="20,000"]');
        const typeSelect = form.querySelector('select');
        const notesArea = form.querySelector('textarea');

        const memberInputs = document.querySelectorAll('.trip-member-input');
        const memberNames = [];
        memberInputs.forEach(input => {
            const val = input.value.trim();
            if (val) memberNames.push(val);
        });

        if (memberNames.length === 0) {
            showNotification('Please enter at least one member name.', 'error');
            return;
        }

        const currentUser = getCurrentUser();
        const payload = {
            name: nameInput?.value.trim() || `${destInput?.value.trim() || 'Exciting'} Tour`,
            destination: destInput?.value.trim() || 'Trip Destination',
            duration: durationInput?.value.trim() || '',
            budget: budgetInput?.value.trim() || '',
            trip_type: typeSelect?.value || 'Friends Trip',
            notes: notesArea?.value.trim() || '',
            created_by: currentUser ? currentUser.id : null,
            members: memberNames
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Setting Up Trip...';
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/create-group/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                showNotification(data.error || 'Failed to create trip', 'error');
            } else {
                setActiveTrip(data.group);
                showNotification(`Trip "${data.group.name}" created! Proceeding to expenses...`, 'success');
                setTimeout(() => {
                    window.location.href = 'add_expense.html';
                }, 800);
            }
        } catch (err) {
            // Local fallback trip persistence if offline
            const fallbackTrip = {
                id: Date.now(),
                name: payload.name,
                destination: payload.destination,
                budget: payload.budget,
                members: memberNames.map((m, idx) => ({ id: idx + 1, name: m }))
            };
            setActiveTrip(fallbackTrip);
            showNotification('Trip saved locally! Navigating to expenses...', 'success');
            setTimeout(() => {
                window.location.href = 'add_expense.html';
            }, 800);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Trip';
            }
        }
    });
}

// â”€â”€â”€ 5. ADD EXPENSE PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function initAddExpensePage() {
    if (!window.location.pathname.includes('add_expense')) return;

    const mainContainer = document.querySelector('.main');
    if (!mainContainer) return;

    // Get or create demo trip if none active
    let activeTrip = getActiveTrip();
    if (!activeTrip || !activeTrip.members || activeTrip.members.length === 0) {
        activeTrip = {
            id: 1,
            name: "My Trip",
            destination: "Destination",
            members: [{ id: 1, name: "You" }, { id: 2, name: "Friend 1" }, { id: 3, name: "Friend 2" }]
        };
        setActiveTrip(activeTrip);
    }

    const memberNames = (activeTrip.members || []).map(m => (typeof m === 'object' ? m.name : m)).filter(Boolean);

    // â”€â”€ Trip Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!document.getElementById('activeTripBanner')) {
        const banner = document.createElement('div');
        banner.id = 'activeTripBanner';
        banner.style.cssText = `
            background: linear-gradient(135deg, #14532d, #15803d);
            color: white;
            padding: 16px 22px;
            border-radius: 14px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            box-shadow: 0 4px 15px rgba(20,83,45,0.25);
        `;
        banner.innerHTML = `
            <div>
                <h3 style="margin:0; font-size:19px; font-weight:700;">
                    <i class="fa-solid fa-map-location-dot"></i> ${activeTrip.name}
                    <span style="font-size:13px; font-weight:400; margin-left:8px; opacity:0.85;">${activeTrip.destination || ''}</span>
                </h3>
                <p style="margin:4px 0 0 0; font-size:13px; color:#bbf7d0;">
                    <i class="fa-solid fa-users"></i> Members: <strong>${memberNames.join(', ')}</strong>
                </p>
            </div>
            <a href="create_trip.html" style="color:white; background:rgba(255,255,255,0.2); text-decoration:none; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:600; white-space:nowrap;">
                <i class="fa-solid fa-plus"></i> New Trip
            </a>
        `;
        const firstChild = mainContainer.querySelector('center') || mainContainer.firstElementChild;
        if (firstChild) {
            firstChild.insertAdjacentElement('afterend', banner);
        } else {
            mainContainer.prepend(banner);
        }
    }

    // â”€â”€ Upgrade "Paid By" inputs → dropdowns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const expenseBlocks = mainContainer.querySelectorAll('.expense-block');
    expenseBlocks.forEach((block) => {
        // Replace text input "Enter name" → select dropdown
        const paidByInput = block.querySelector('input[placeholder="Enter name"]');
        if (paidByInput) {
            const select = document.createElement('select');
            select.className = 'paid-by-select';
            select.style.cssText = `
                width: 100%;
                padding: 10px 14px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                color: #374151;
                cursor: pointer;
                margin-bottom: 10px;
            `;
            select.innerHTML = `<option value="">— Who paid? —</option>` +
                memberNames.map(n => `<option value="${n}">${n}</option>`).join('');
            paidByInput.replaceWith(select);
        }

        // Add amount input if not present
        if (!block.querySelector('.block-amount-input')) {
            const amtWrap = document.createElement('div');
            amtWrap.style.marginTop = '8px';
            amtWrap.innerHTML = `
                <label style="font-size:13px; color:#374151; font-weight:600; display:block; margin-bottom:4px;">
                    <i class="fa-solid fa-indian-rupee-sign"></i> Amount (₹):
                </label>
                <input type="number" min="0" class="block-amount-input" placeholder="e.g. 500"
                    style="width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:8px; font-size:14px;">
            `;
            block.appendChild(amtWrap);
        }
    });

    // â”€â”€ Dynamic Split Among Members section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const memberCardsContainer = document.getElementById('memberCardsContainer');
    if (memberCardsContainer) {
        memberCardsContainer.innerHTML = '';
        if (memberNames.length === 0) {
            memberCardsContainer.innerHTML = `
                <p style="color:#ef4444; text-align:center; padding:16px;">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    No trip members found. <a href="create_trip.html" style="color:#14532d; font-weight:600;">Create a trip first</a>.
                </p>`;
        } else {
            memberNames.forEach((name, i) => {
                const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                const card = document.createElement('div');
                card.className = 'card';
                card.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                    padding: 14px 18px;
                    border-radius: 12px;
                    background: white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
                    margin-bottom: 10px;
                    border: 1px solid #e5e7eb;
                    transition: box-shadow 0.2s;
                `;
                card.innerHTML = `
                    <div class="card-left" style="display:flex; align-items:center; gap:12px; flex:1;">
                        <div style="
                            width:42px; height:42px; border-radius:50%;
                            background: linear-gradient(135deg, #14532d, #22c55e);
                            color:white; font-weight:700; font-size:15px;
                            display:flex; align-items:center; justify-content:center;
                            flex-shrink:0;">
                            ${initials}
                        </div>
                        <div>
                            <div style="font-weight:600; color:#111827; font-size:15px;">${name}</div>
                            <div style="font-size:12px; color:#6b7280;">Member ${i + 1}</div>
                        </div>
                    </div>
                    <input type="number" class="member-share-input" data-member="${name}"
                        placeholder="₹ share" min="0"
                        style="width:110px; padding:9px 12px; border:1px solid #d1d5db;
                               border-radius:10px; font-size:14px; text-align:center;
                               flex-shrink:0; background:white;">
                `;
                memberCardsContainer.appendChild(card);
            });

            // Live total counter
            const totalCounter = document.createElement('div');
            totalCounter.id = 'splitTotalCounter';
            totalCounter.style.cssText = `
                margin-top: 14px;
                padding: 12px 16px;
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 10px;
                font-size: 14px;
                color: #14532d;
                font-weight: 600;
                display: flex;
                justify-content: space-between;
            `;
            totalCounter.innerHTML = `<span>Split Total:</span><span id="splitRunningTotal">₹0</span>`;
            memberCardsContainer.appendChild(totalCounter);

            // Update running total
            memberCardsContainer.addEventListener('input', () => {
                const shares = [...memberCardsContainer.querySelectorAll('.member-share-input')];
                const total = shares.reduce((sum, inp) => sum + (parseFloat(inp.value) || 0), 0);
                const el = document.getElementById('splitRunningTotal');
                if (el) el.textContent = `₹${total.toFixed(2)}`;
            });
        }
    }

    // â”€â”€ Save Expenses Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const saveBtn = document.getElementById('saveExpensesBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // Gather expenses from blocks
            const gatheredExpenses = [];
            expenseBlocks.forEach(block => {
                const descSelect = block.querySelector('select:first-of-type');
                const payerSelect = block.querySelector('.paid-by-select');
                const amtInput   = block.querySelector('.block-amount-input');

                const desc  = descSelect?.value || '';
                const payer = payerSelect?.value || memberNames[0] || 'Member 1';
                const amt   = parseFloat(amtInput?.value) || 0;

                if (desc && amt > 0) {
                    gatheredExpenses.push({
                        description: desc,
                        category: desc,
                        amount: amt,
                        paid_by_name: payer
                    });
                }
            });

            // Also collect per-member custom shares
            const memberShareInputs = document.querySelectorAll('.member-share-input');
            if (gatheredExpenses.length === 0 && memberShareInputs.length > 0) {
                memberShareInputs.forEach(inp => {
                    const amt = parseFloat(inp.value) || 0;
                    if (amt > 0) {
                        gatheredExpenses.push({
                            description: 'Trip Share',
                            category: 'General',
                            amount: amt,
                            paid_by_name: inp.dataset.member || memberNames[0]
                        });
                    }
                });
            }

            if (gatheredExpenses.length === 0) {
                showNotification('Please fill in at least one expense type and amount.', 'error');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

            try {
                for (const exp of gatheredExpenses) {
                    await fetch(`${API_BASE_URL}/api/add-expense/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            group_id: activeTrip.id,
                            ...exp
                        })
                    });
                }
                showNotification('Expenses saved! Computing settlement...', 'success');
                setTimeout(() => { window.location.href = 'summary.html'; }, 800);
            } catch {
                showNotification('Saved locally. Navigating to summary...', 'success');
                setTimeout(() => { window.location.href = 'summary.html'; }, 800);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Save Expenses &amp; View Summary';
            }
        });
    }
}

// --- 6. SUMMARY PAGE ---

async function initSummaryPage() {
    const mainContainer = document.querySelector('.main');
    if (!mainContainer || !window.location.pathname.includes('summary')) return;

    let activeTrip = getActiveTrip();
    if (!activeTrip) {
        activeTrip = {
            id: 1,
            name: "My Trip",
            destination: "Tour",
            members: [{ id: 1, name: "Member 1" }, { id: 2, name: "Member 2" }]
        };
    }

    // Set page header to trip name
    const heading = mainContainer.querySelector('h1');
    if (heading) {
        heading.innerHTML = `Expense Summary <span style="font-size:18px; font-weight:400; color:#15803d;">(${activeTrip.name})</span>`;
    }

    const summaryBox = mainContainer.querySelector('.summary-box');
    const cardsContainer = mainContainer.querySelector('.cards');

    if (summaryBox) {
        summaryBox.innerHTML = `
            <div>Total Expense<strong id="sumTotal">Calculating...</strong></div>
            <div>Members<strong id="sumMembers">${(activeTrip.members || []).length}</strong></div>
            <div>Per Person<strong id="sumPerPerson">Calculating...</strong></div>
        `;
    }

    if (cardsContainer) {
        cardsContainer.innerHTML = `<div style="text-align:center; padding:30px; color:#6b7280;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>Calculating optimal debt settlement...</p></div>`;
    }

    try {
        // Fetch balances and settlements from API
        const [balRes, settleRes, detailsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/balances/${activeTrip.id}/`).then(r => r.json()).catch(() => null),
            fetch(`${API_BASE_URL}/api/settle/${activeTrip.id}/`).then(r => r.json()).catch(() => null),
            fetch(`${API_BASE_URL}/api/group/${activeTrip.id}/`).then(r => r.json()).catch(() => null)
        ]);

        const totalExpense = balRes?.total_expense || detailsRes?.total_expense || 0;
        const membersCount = balRes?.members_count || (activeTrip.members || []).length || 1;
        const perPerson = balRes?.per_person || (totalExpense / membersCount) || 0;

        // Update Summary Box
        const sumTotal = document.getElementById('sumTotal');
        const sumMembers = document.getElementById('sumMembers');
        const sumPerPerson = document.getElementById('sumPerPerson');

        if (sumTotal) sumTotal.textContent = `₹${totalExpense.toFixed(2)}`;
        if (sumMembers) sumMembers.textContent = membersCount;
        if (sumPerPerson) sumPerPerson.textContent = `₹${perPerson.toFixed(2)}`;

        // Render Settlement Transactions
        if (cardsContainer) {
            cardsContainer.innerHTML = '';
            const transactions = settleRes?.transactions || [];

            if (transactions.length === 0) {
                cardsContainer.innerHTML = `
                    <div class="settled-card" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:14px; padding:24px; text-align:center; color:#14532d; grid-column:1/-1;">
                        <i class="fa-solid fa-circle-check" style="font-size:32px; margin-bottom:10px; color:#22c55e;"></i>
                        <h3 style="margin:0; font-size:18px;">All Settled Up!</h3>
                        <p style="margin:6px 0 0 0; font-size:14px; color:#4b5563;">Everyone has paid their fair share. No outstanding debts for this trip.</p>
                    </div>
                `;
            } else {
                transactions.forEach((tx, idx) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style.cssText = `
                        background: white;
                        border-radius: 14px;
                        padding: 18px 24px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                        border-left: 5px solid #22c55e;
                        margin-bottom: 12px;
                    `;
                    card.innerHTML = `
                        <div class="card-left" style="display:flex; align-items:center; gap:14px;">
                            <div class="tx-avatar" style="width:44px; height:44px; border-radius:50%; background:#dcfce7; color:#15803d; display:flex; align-items:center; justify-content:center; font-size:20px;">
                                <i class="fa-solid fa-money-bill-transfer"></i>
                            </div>
                            <div class="card-text" style="font-size:16px; font-weight:600; color:#1f2937;">
                                <span style="color:#ef4444;">${tx.from}</span> owes <span style="color:#15803d;">${tx.to}</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:16px;">
                            <div class="amount" style="font-size:20px; font-weight:700; color:#14532d;">₹${parseFloat(tx.amount).toFixed(2)}</div>
                            <button class="settle-btn" style="background:#22c55e; color:white; border:none; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;" onclick="this.textContent='Settled ✓'; this.style.background='#9ca3af'; this.disabled=true;">Settle</button>
                        </div>
                    `;
                    cardsContainer.appendChild(card);
                });
            }

            // Append Member Balances Section
            if (balRes?.balances) {
                const balSection = document.createElement('div');
                balSection.style.marginTop = '30px';
                balSection.innerHTML = `
                    <h3 style="color:#14532d; margin-bottom:14px; font-size:20px; font-weight:700;"><i class="fa-solid fa-scale-balanced"></i> Member Net Balances</h3>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
                        ${Object.entries(balRes.balances).map(([name, bal]) => {
                            const isPositive = bal >= 0;
                            return `
                                <div class="balance-card" style="background:white; padding:16px 20px; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.04); border-top:3px solid ${isPositive ? '#22c55e' : '#ef4444'};">
                                    <div class="balance-name" style="font-size:15px; font-weight:600; color:#1f2937;">${name}</div>
                                    <div style="font-size:18px; font-weight:700; margin-top:6px; color:${isPositive ? '#15803d' : '#ef4444'};">
                                        ${isPositive ? '+₹' : '-₹'}${Math.abs(bal).toFixed(2)}
                                        <span style="font-size:12px; font-weight:500; color:#6b7280; display:block;">${isPositive ? 'Gets back' : 'Owes'}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                cardsContainer.parentNode.appendChild(balSection);
            }

            // Append Action Buttons: "Add More Expenses" and "Print / Export"
            const actionDiv = document.createElement('div');
            actionDiv.style.cssText = 'display:flex; gap:14px; margin-top:28px; justify-content:center; flex-wrap:wrap;';
            actionDiv.innerHTML = `
                <a href="add_expense.html" style="background:#14532d; color:white; padding:12px 24px; border-radius:10px; text-decoration:none; font-weight:600; font-size:14px; display:inline-flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-plus"></i> Add More Expenses
                </a>
                <button onclick="window.print()" style="background:white; color:#14532d; border:1px solid #14532d; padding:12px 24px; border-radius:10px; font-weight:600; font-size:14px; cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-print"></i> Print Summary
                </button>
            `;
            cardsContainer.parentNode.appendChild(actionDiv);
        }
    } catch (err) {
        console.error("Error loading summary:", err);
    }
}

// â”€â”€â”€ 7. CONTACT PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function initContactPage() {
    const formSection = document.querySelector('.main .form-section');
    if (!formSection) return;

    const btn = formSection.querySelector('button');
    const nameInput = formSection.querySelector('input[placeholder*="Name"]');
    const emailInput = formSection.querySelector('input[placeholder*="Email"]');
    const msgInput = formSection.querySelector('textarea');

    if (!btn || !nameInput || !emailInput || !msgInput) return;

    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = msgInput.value.trim();

        if (!name || !email || !message) {
            showNotification('Please fill out all fields before submitting.', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const res = await fetch(`${API_BASE_URL}/api/contact/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });
            const data = await res.json();

            if (res.ok) {
                showNotification(data.msg || 'Message sent! We will reach out shortly.', 'success');
                nameInput.value = '';
                emailInput.value = '';
                msgInput.value = '';
            } else {
                showNotification(data.error || 'Failed to send message', 'error');
            }
        } catch (err) {
            showNotification('Thank you! Your message has been noted.', 'success');
            nameInput.value = '';
            emailInput.value = '';
            msgInput.value = '';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Submit →';
        }
    });
}

// ─── Beams Background (dark mode only) ─────────────────────
// Vanilla-JS port of the 21st.dev BeamsBackground component:
// blurred cyan-blue beams rising behind the page content.
(function () {
    if (document.getElementById('beams-bg')) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'beams-bg';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;filter:blur(12px);display:none;';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var beams = [];
    var rafId = null;
    var MIN_BEAMS = 20;

    function createBeam(w, h) {
        return {
            x: Math.random() * w * 1.5 - w * 0.25,
            y: Math.random() * h * 1.5 - h * 0.25,
            width: 30 + Math.random() * 60,
            length: h * 2.5,
            angle: -35 + Math.random() * 10,
            speed: 0.6 + Math.random() * 1.2,
            opacity: 0.12 + Math.random() * 0.16,
            hue: 190 + Math.random() * 70,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03
        };
    }

    function resetBeam(beam, index, total, w, h) {
        var column = index % 3;
        var spacing = w / 3;
        beam.y = h + 100;
        beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
        beam.width = 100 + Math.random() * 100;
        beam.speed = 0.5 + Math.random() * 0.4;
        beam.hue = 190 + (index * 70) / total;
        beam.opacity = 0.2 + Math.random() * 0.1;
    }

    function drawBeam(beam) {
        ctx.save();
        ctx.translate(beam.x, beam.y);
        ctx.rotate((beam.angle * Math.PI) / 180);
        var pulsing = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2);
        var g = ctx.createLinearGradient(0, 0, 0, beam.length);
        g.addColorStop(0, 'hsla(' + beam.hue + ', 85%, 65%, 0)');
        g.addColorStop(0.1, 'hsla(' + beam.hue + ', 85%, 65%, ' + (pulsing * 0.5) + ')');
        g.addColorStop(0.4, 'hsla(' + beam.hue + ', 85%, 65%, ' + pulsing + ')');
        g.addColorStop(0.6, 'hsla(' + beam.hue + ', 85%, 65%, ' + pulsing + ')');
        g.addColorStop(0.9, 'hsla(' + beam.hue + ', 85%, 65%, ' + (pulsing * 0.5) + ')');
        g.addColorStop(1, 'hsla(' + beam.hue + ', 85%, 65%, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
        ctx.restore();
    }

    function resize() {
        var dpr = window.devicePixelRatio || 1;
        var w = window.innerWidth;
        var h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var total = Math.round(MIN_BEAMS * 1.5);
        beams = [];
        for (var i = 0; i < total; i++) beams.push(createBeam(w, h));
    }

    function frame() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);
        var total = beams.length;
        for (var i = 0; i < total; i++) {
            var b = beams[i];
            b.y -= b.speed;
            b.pulse += b.pulseSpeed;
            if (b.y + b.length < -100) resetBeam(b, i, total, w, h);
            drawBeam(b);
        }
        rafId = requestAnimationFrame(frame);
    }

    function update() {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (dark && rafId === null) {
            resize();
            canvas.style.display = 'block';
            rafId = requestAnimationFrame(frame);
        } else if (!dark && rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
            canvas.style.display = 'none';
        }
    }

    window.addEventListener('resize', function () {
        if (rafId !== null) resize();
    });

    if (typeof MutationObserver !== 'undefined') {
        new MutationObserver(update).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    update();
})();

// ─── Silk Shader Background (light mode only) ──────────────
// Vanilla-WebGL port of the 21st.dev "Silk" ShaderBackground:
// a slowly-flowing green palette behind the page content.
(function () {
    if (document.getElementById('silk-bg')) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var VERT = 'attribute vec2 a_position;\nvoid main() { gl_Position = vec4(a_position, 0.0, 1.0); }';

    var FRAG = [
        '#ifdef GL_FRAGMENT_PRECISION_HIGH',
        'precision highp float;',
        '#else',
        'precision mediump float;',
        '#endif',
        'uniform vec3 u_colors[8];',
        'uniform vec4 u_scene;',
        'uniform vec4 u_shape;',
        'uniform vec4 u_surface;',
        'uniform vec4 u_finish;',
        'uniform vec4 u_transform;',
        '#define u_resolution u_scene.xy',
        '#define u_time u_scene.z',
        '#define u_colorCount u_scene.w',
        '#define u_scale u_shape.x',
        '#define u_intensity u_shape.y',
        '#define u_detail u_surface.x',
        '#define u_contrast u_surface.y',
        '#define u_saturation u_surface.w',
        '#define u_hue u_finish.x',
        '#define u_seed u_transform.x',
        '#define u_rotate u_transform.y',
        'float hash21(vec2 p) {',
        '  p = fract(p * vec2(234.34, 435.345));',
        '  p += dot(p, p + 34.23);',
        '  return fract(p.x * p.y);',
        '}',
        'float grainHash(vec2 p) {',
        '  vec3 p3 = fract(vec3(p.xyx) * 0.1031);',
        '  p3 += dot(p3, p3.yzx + 33.33);',
        '  return fract((p3.x + p3.y) * p3.z);',
        '}',
        'float noise(vec2 p) {',
        '  vec2 i = floor(p);',
        '  vec2 f = fract(p);',
        '  vec2 u = f * f * (3.0 - 2.0 * f);',
        '  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);',
        '}',
        'float fbm(vec2 p) {',
        '  float v = 0.0;',
        '  float a = 0.5;',
        '  for (int i = 0; i < 5; i++) {',
        '    v += a * noise(p);',
        '    p = p * 2.03 + vec2(17.0, 9.2);',
        '    a *= 0.5;',
        '  }',
        '  return v;',
        '}',
        'vec3 mixColour(vec3 a, vec3 b, float t) { return mix(a, b, t); }',
        'vec3 palette(float x) {',
        '  float n = max(u_colorCount - 1.0, 1.0);',
        '  float f = clamp(x, 0.0, 1.0) * n;',
        '  vec3 col = u_colors[0];',
        '  for (int i = 0; i < 7; i++) {',
        '    if (float(i) < n) col = mixColour(col, u_colors[i + 1], smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));',
        '  }',
        '  return col;',
        '}',
        'vec3 hueRotate(vec3 col, float a) {',
        '  const mat3 toYIQ = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);',
        '  const mat3 toRGB = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);',
        '  vec3 yiq = toYIQ * col;',
        '  float ca = cos(a), sa = sin(a);',
        '  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);',
        '  return toRGB * yiq;',
        '}',
        'vec3 shade(vec2 p, float t) {',
        '  vec2 q = p * 1.6;',
        '  float amp = 0.25 + u_intensity * 0.85;',
        '  for (float i = 1.0; i < 5.0; i += 1.0) {',
        '    q.x += amp / i * cos(i * 2.4 * q.y + t * 0.8 + u_seed);',
        '    q.y += amp / i * cos(i * 1.7 * q.x + t * 0.6);',
        '  }',
        '  return palette(0.5 + 0.5 * sin(q.x + q.y));',
        '}',
        'void main() {',
        '  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);',
        '  p *= u_scale;',
        '  if (abs(u_rotate) > 0.0001) {',
        '    float cr = cos(u_rotate), sr = sin(u_rotate);',
        '    p = mat2(cr, -sr, sr, cr) * p;',
        '  }',
        '  p += vec2(0.060, 0.600);',
        '  vec3 col = shade(p, u_time);',
        '  if (abs(u_contrast - 1.0) > 0.0001) col = (col - 0.5) * u_contrast + 0.5;',
        '  if (abs(u_saturation - 1.0) > 0.0001) {',
        '    float luma = dot(col, vec3(0.299, 0.587, 0.114));',
        '    col = mix(vec3(luma), col, u_saturation);',
        '  }',
        '  if (abs(u_hue) > 0.0001) col = hueRotate(col, u_hue);',
        '  col += (grainHash(gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * 0.014;',
        '  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);',
        '}'
    ].join('\n');

    var canvas = document.createElement('canvas');
    canvas.id = 'silk-bg';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-2;pointer-events:none;display:none;';
    document.body.appendChild(canvas);

    var gl = canvas.getContext('webgl', { antialias: false });
    if (!gl) return;

    function compile(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('silk-bg shader error:', gl.getShaderInfoLog(s));
        }
        return s;
    }
    var program = gl.createProgram();
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('silk-bg link error:', gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uni = {
        colors: gl.getUniformLocation(program, 'u_colors'),
        scene: gl.getUniformLocation(program, 'u_scene'),
        shape: gl.getUniformLocation(program, 'u_shape'),
        surface: gl.getUniformLocation(program, 'u_surface'),
        finish: gl.getUniformLocation(program, 'u_finish'),
        transform: gl.getUniformLocation(program, 'u_transform')
    };

    // Palette from the component: deep green -> mid green -> light green -> cream
    gl.uniform3fv(uni.colors, new Float32Array([
        0.0118, 0.0706, 0.0549,
        0.0549, 0.4863, 0.3529,
        0.4863, 0.8980, 0.4667,
        0.9569, 1.0, 0.7804,
        0.9569, 1.0, 0.7804,
        0.9569, 1.0, 0.7804,
        0.9569, 1.0, 0.7804,
        0.9569, 1.0, 0.7804
    ]));
    gl.uniform4f(uni.shape, 0.58, 0.20, 0.5, 0.0);
    gl.uniform4f(uni.surface, 2.4, 0.807, 0.0, 1.0);
    gl.uniform4f(uni.finish, 0.0, 0.0, 0.0, 0.014);
    gl.uniform4f(uni.transform, 707.0, 2.5133, 0.0, 0.0);

    var rafId = null;
    var start = performance.now();
    var TIME_SCALE = 0.841;

    function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = Math.max(1, Math.round(window.innerWidth * dpr));
        var h = Math.max(1, Math.round(window.innerHeight * dpr));
        var pixelScale = Math.min(1, Math.sqrt(2000000 / Math.max(1, w * h)));
        w = Math.max(1, Math.round(w * pixelScale));
        h = Math.max(1, Math.round(h * pixelScale));
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
        }
    }

    function render(now) {
        resize();
        gl.uniform4f(uni.scene, canvas.width, canvas.height, ((now - start) / 1000) * TIME_SCALE, 4);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        rafId = requestAnimationFrame(render);
    }

    function update() {
        var light = document.documentElement.getAttribute('data-theme') !== 'dark';
        if (light && rafId === null) {
            resize();
            canvas.style.display = 'block';
            rafId = requestAnimationFrame(render);
        } else if (!light && rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
            canvas.style.display = 'none';
        }
    }

    window.addEventListener('resize', function () { if (rafId !== null) resize(); });

    if (typeof MutationObserver !== 'undefined') {
        new MutationObserver(update).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    update();
})();
