"use strict";
/* =========================================
   1. INSURANCE PLAN DATA
\========================================= */
let insurancePlans = [
    {
        id: 1,
        name: "Essential Health",
        category: "Health",
        icon: "♡",
        price: 499,
        coverage: "Up to ₹5 Lakhs",
        description:
            "A sample health insurance plan designed to help with eligible medical and hospitalization expenses.",
        benefits: [
            "Sample hospitalization coverage",
            "Medical expense protection",
            "Hospital stay benefits"
        ]
    },
    {
        id: 2,
        name: "Family Health Plus",
        category: "Health",
        icon: "✚",
        price: 999,
        coverage: "Up to ₹10 Lakhs",
        description:
            "A sample family health plan intended to demonstrate coverage options for family members.",
        benefits: [
            "Family coverage options",
            "Sample hospitalization benefits",
            "Medical expense protection"
        ]
    },
    {
        id: 3,
        name: "Two-Wheeler Protect",
        category: "Vehicle",
        icon: "⌁",
        price: 299,
        coverage: "Plan-dependent",
        description:
            "A sample insurance plan for two-wheelers, illustrating vehicle protection and policy selection.",
        benefits: [
            "Vehicle protection options",
            "Sample third-party coverage",
            "Policy details for comparison"
        ]
    },
    {
        id: 4,
        name: "Car Secure",
        category: "Vehicle",
        icon: "🚘",
        price: 799,
        coverage: "Plan-dependent",
        description:
            "A sample car insurance plan to demonstrate vehicle insurance features and policy comparisons.",
        benefits: [
            "Vehicle protection options",
            "Sample accident-related coverage",
            "Policy details for comparison"
        ]
    },
    {
        id: 5,
        name: "Life Protection",
        category: "Life",
        icon: "♡",
        price: 699,
        coverage: "Up to ₹25 Lakhs",
        description:
            "A sample life insurance plan illustrating how life protection options can be displayed online.",
        benefits: [
            "Sample life cover",
            "Family financial protection",
            "Policy information for comparison"
        ]
    },
    {
        id: 6,
        name: "Family Future",
        category: "Life",
        icon: "♧",
        price: 1299,
        coverage: "Up to ₹50 Lakhs",
        description:
            "A sample life insurance plan intended to demonstrate long-term family protection options.",
        benefits: [
            "Sample life cover",
            "Long-term protection options",
            "Family financial planning"
        ]
    }
];
/* =========================================
   2. GET HTML ELEMENTS
\========================================= */
const policyGrid = document.getElementById("policyGrid");
const filterButtons = document.getElementById("filterButtons");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");
const selectedPlanText = document.getElementById("selectedPlanText");
const clearSelectionBtn = document.getElementById("clearSelectionBtn");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const authModal = document.getElementById("authModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const authForm = document.getElementById("authForm");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authSwitchText = document.getElementById("authSwitchText");
const authMessage = document.getElementById("authMessage");
const nameGroup = document.getElementById("nameGroup");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const detailsModal = document.getElementById("detailsModal");
const detailsBackdrop = document.getElementById("detailsBackdrop");
const closeDetailsBtn = document.getElementById("closeDetailsBtn");
const detailsCategory = document.getElementById("detailsCategory");
const detailsTitle = document.getElementById("detailsTitle");
const detailsPrice = document.getElementById("detailsPrice");
const detailsDescription = document.getElementById("detailsDescription");
const detailsBenefits = document.getElementById("detailsBenefits");
const detailsSelectBtn = document.getElementById("detailsSelectBtn");
const toast = document.getElementById("toast");
document.getElementById("currentYear").textContent =
    new Date().getFullYear();
/* =========================================
   3. APPLICATION STATE
\========================================= */
let currentCategory = "All";
let currentSearch = "";
let currentAuthMode = "login";
let currentDetailsPlanId = null;
let toastTimer = null;
/* =========================================
   4. SAFE LOCAL STORAGE FUNCTIONS
\========================================= */
function readStoredPlan() {
    try {
        const savedPlan = localStorage.getItem("insureCareSelectedPlan");
        if (!savedPlan) {
            return null;
        }
        const parsedPlan = JSON.parse(savedPlan);
        if (
            parsedPlan &&
            Number.isInteger(parsedPlan.id) &&
            insurancePlans.some(plan => plan.id === parsedPlan.id)
        ) {
            return parsedPlan;
        }
        return null;
    } catch (error) {
        console.warn("Could not read the selected plan:", error);
        return null;
    }
}
function savePlanToStorage(plan) {
    try {
        localStorage.setItem(
            "insureCareSelectedPlan",
            JSON.stringify({
                id: plan.id
            })
        );
        return true;
    } catch (error) {
        console.warn("Could not save the selected plan:", error);
        return false;
    }
}
function removePlanFromStorage() {
    try {
        localStorage.removeItem("insureCareSelectedPlan");
        return true;
    } catch (error) {
        console.warn("Could not clear the selected plan:", error);
        return false;
    }
}
/* =========================================
   5. DISPLAY INSURANCE PLANS
\========================================= */
function displayPolicies() {
    const filteredPlans = insurancePlans.filter(plan => {
        const matchesCategory =
            currentCategory === "All" ||
            plan.category === currentCategory;
        const searchText = currentSearch.toLowerCase();
        const matchesSearch =
            plan.name.toLowerCase().includes(searchText) ||
            plan.category.toLowerCase().includes(searchText) ||
            plan.description.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });
    policyGrid.replaceChildren();
    emptyMessage.hidden = filteredPlans.length !== 0;
    filteredPlans.forEach(plan => {
        const card = document.createElement("article");
        card.className = "policy-card";
        // Top section
        const top = document.createElement("div");
        top.className = "policy-card-top";
        const icon = document.createElement("div");
        icon.className = "policy-icon";
        icon.textContent = plan.icon;
        icon.setAttribute("aria-hidden", "true");
        const badge = document.createElement("span");
        badge.className = "category-badge";
        badge.textContent = plan.category;
        top.append(icon, badge);
        // Plan name
        const title = document.createElement("h3");
        title.textContent = plan.name;
        // Description
        const description = document.createElement("p");
        description.className = "policy-description";
        description.textContent = plan.description;
        // Price
        const price = document.createElement("div");
        price.className = "policy-price";
        price.textContent = `₹${plan.price.toLocaleString("en-IN")}`;
        const priceSuffix = document.createElement("small");
        priceSuffix.textContent = " / month (sample)";
        price.appendChild(priceSuffix);
        // Coverage
        const coverage = document.createElement("p");
        coverage.className = "coverage-label";
        coverage.textContent = `Sample coverage: ${plan.coverage}`;
        // Benefits
        const benefits = document.createElement("ul");
        benefits.className = "policy-benefits";
        plan.benefits.forEach(benefit => {
            const item = document.createElement("li");
            item.textContent = benefit;
            benefits.appendChild(item);
        });
        // Buttons
        const actions = document.createElement("div");
        actions.className = "policy-actions";
        const detailsButton = document.createElement("button");
        detailsButton.className = "btn btn-outline";
        detailsButton.type = "button";
        detailsButton.textContent = "View Details";
        detailsButton.dataset.action = "details";
        detailsButton.dataset.id = String(plan.id);
        const selectButton = document.createElement("button");
        selectButton.className = "btn btn-primary";
        selectButton.type = "button";
        selectButton.textContent = "Select Plan";
        selectButton.dataset.action = "select";
        selectButton.dataset.id = String(plan.id);
        actions.append(detailsButton, selectButton);
        // Assemble card
        card.append(
            top,
            title,
            description,
            price,
            coverage,
            benefits,
            actions
        );
        policyGrid.appendChild(card);
    });
}
/* =========================================
   6. CATEGORY FILTERS
\========================================= */
filterButtons.addEventListener("click", function (event) {
    const button = event.target.closest(".filter-btn");
    if (!button) {
        return;
    }
    currentCategory = button.dataset.category || "All";
    // Update selected filter styling
    filterButtons.querySelectorAll(".filter-btn").forEach(filter => {
        const isActive = filter === button;
        filter.classList.toggle("active", isActive);
        filter.setAttribute("aria-pressed", String(isActive));
    });
    displayPolicies();
});
/* =========================================
   7. SEARCH INSURANCE PLANS
\========================================= */
searchInput.addEventListener("input", function () {
    currentSearch = searchInput.value.trim();
    displayPolicies();
});
/* =========================================
   8. SELECTED PLAN
\========================================= */
function authHeaders() {
    const token = sessionStorage.getItem("authToken");
    return token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };
}

// null = nothing saved on the account (or guest)
let accountPlanId = null;

function handleExpiredSession() {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    accountPlanId = null;
    updateAuthButtons();
    updateSelectedPlan();
    showToast("Session expired. Please log in again.");
}

async function loadAccountPlan() {
    if (!sessionStorage.getItem("authToken")) {
        accountPlanId = null;
        return;
    }
    try {
        const res = await fetch("/api/my-policy", { headers: authHeaders() });
        if (res.status === 401) return handleExpiredSession();
        const data = await res.json();
        accountPlanId = data.selection ? data.selection.policy.id : null;
    } catch (err) {
        console.warn("Could not load your saved plan:", err);
    }
}

async function selectPlan(planId) {
    const plan = insurancePlans.find(item => item.id === planId);
    if (!plan) {
        showToast("Insurance plan not found.");
        return;
    }

    if (sessionStorage.getItem("authToken")) {
        try {
            const res = await fetch("/api/my-policy", {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify({ policyId: plan.id })
            });
            if (res.status === 401) return handleExpiredSession();
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Could not save the plan.");
            accountPlanId = plan.id;
            showToast(`${plan.name} saved to your account!`);
        } catch (err) {
            showToast(err.message);
            return;
        }
    } else {
        savePlanToStorage(plan);
        showToast(`${plan.name} selected. Log in to save it to your account.`);
    }

    updateSelectedPlan();
    closeDetailsModal();
    document.getElementById("selectedSection").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function updateSelectedPlan() {
    const loggedIn = Boolean(sessionStorage.getItem("authToken"));
    const savedPlan = loggedIn
        ? (accountPlanId !== null ? { id: accountPlanId } : null)
        : readStoredPlan();
    if (!savedPlan) {
        selectedPlanText.textContent =
            "You have not selected a plan yet.";
        clearSelectionBtn.hidden = true;
        return;
    }
    const plan = insurancePlans.find(item => item.id === savedPlan.id);
    if (!plan) {
        selectedPlanText.textContent =
            "You have not selected a plan yet.";
        clearSelectionBtn.hidden = true;
        return;
    }
    selectedPlanText.textContent =
        `${plan.name} (${plan.category}) — ₹${plan.price.toLocaleString("en-IN")} per month (sample premium).`;
    clearSelectionBtn.hidden = false;
}
clearSelectionBtn.addEventListener("click", async function () {
    if (sessionStorage.getItem("authToken")) {
        try {
            await fetch("/api/my-policy", { method: "DELETE", headers: authHeaders() });
            accountPlanId = null;
        } catch (err) {
            showToast("Could not remove the plan. Try again.");
            return;
        }
    } else {
        removePlanFromStorage();
    }
    updateSelectedPlan();
    showToast("Selected plan cleared.");
});
/* =========================================
   9. VIEW PLAN DETAILS
\========================================= */
function openDetailsModal(planId) {
    const plan = insurancePlans.find(item => item.id === planId);
    if (!plan) {
        showToast("Could not find the selected plan.");
        return;
    }
    currentDetailsPlanId = plan.id;
    detailsCategory.textContent = `${plan.category.toUpperCase()} INSURANCE`;
    detailsTitle.textContent = plan.name;
    detailsPrice.textContent =
        `₹${plan.price.toLocaleString("en-IN")} / month (sample)`;
    detailsDescription.textContent = plan.description;
    detailsBenefits.replaceChildren();
    plan.benefits.forEach(benefit => {
        const item = document.createElement("li");
        item.textContent = benefit;
        detailsBenefits.appendChild(item);
    });
    openModal(detailsModal);
    closeMenu();
}
detailsSelectBtn.addEventListener("click", function () {
    if (currentDetailsPlanId !== null) {
        selectPlan(currentDetailsPlanId);
    }
});
/* =========================================
   10. HANDLE PLAN BUTTON CLICKS
\========================================= */
policyGrid.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
        return;
    }
    const planId = Number(button.dataset.id);
    if (!Number.isInteger(planId)) {
        return;
    }
    if (button.dataset.action === "details") {
        openDetailsModal(planId);
    } else if (button.dataset.action === "select") {
        selectPlan(planId);
    }
});
/* =========================================
   11. OPEN AND CLOSE MODALS
\========================================= */
function openModal(modal) {
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const firstInput = modal.querySelector("input");
    if (firstInput) {
        window.setTimeout(() => firstInput.focus(), 50);
    } else {
        const closeButton = modal.querySelector(".modal-close");
        if (closeButton) {
            window.setTimeout(() => closeButton.focus(), 50);
        }
    }
}
function closeModal(modal) {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    const anotherModalOpen =
        !authModal.hidden || !detailsModal.hidden;
    if (!anotherModalOpen) {
        document.body.classList.remove("modal-open");
    }
}
function closeAuthModal() {
    closeModal(authModal);
    clearAuthMessage();
    clearFieldErrors();
}
function closeDetailsModal() {
    closeModal(detailsModal);
    currentDetailsPlanId = null;
}
loginBtn.addEventListener("click", function () {
    closeMenu();
    if (sessionStorage.getItem("authToken")) return;
    openAuthModal("login");
});
registerBtn.addEventListener("click", function () {
    closeMenu();
    if (sessionStorage.getItem("authToken")) {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("authUser");
        accountPlanId = null;
        updateAuthButtons();
        updateSelectedPlan();
        showToast("Logged out.");
        return;
    }
    openAuthModal("register");
});
closeModalBtn.addEventListener("click", closeAuthModal);
modalBackdrop.addEventListener("click", closeAuthModal);
closeDetailsBtn.addEventListener("click", closeDetailsModal);
detailsBackdrop.addEventListener("click", closeDetailsModal);
/* =========================================
   12. LOGIN AND REGISTER TABS
\========================================= */
function openAuthModal(mode) {
    updateAuthForm(mode);
    openModal(authModal);
}
function updateAuthForm(mode) {
    currentAuthMode = mode;
    const isRegister = mode === "register";
    nameGroup.hidden = !isRegister;
    nameInput.required = isRegister;
    passwordInput.autocomplete = isRegister
        ? "new-password"
        : "current-password";
    modalTitle.textContent = isRegister
        ? "Create an Account"
        : "Welcome Back!";
    modalDescription.textContent = isRegister
        ? "Enter your details to continue."
        : "Log in to continue.";
    authSubmitBtn.textContent = isRegister
        ? "Create Account"
        : "Login";
    loginTab.classList.toggle("active", !isRegister);
    registerTab.classList.toggle("active", isRegister);
    loginTab.setAttribute("aria-selected", String(!isRegister));
    registerTab.setAttribute("aria-selected", String(isRegister));
    authSwitchText.replaceChildren();
    const switchLabel = document.createTextNode(
        isRegister
            ? "Already have an account? "
            : "Don't have an account? "
    );
    const switchButton = document.createElement("button");
    switchButton.type = "button";
    switchButton.id = isRegister
        ? "switchToLogin"
        : "switchToRegister";
    switchButton.textContent = isRegister ? "Login" : "Register";
    switchButton.addEventListener("click", function () {
        updateAuthForm(isRegister ? "login" : "register");
    });
    authSwitchText.append(switchLabel, switchButton);
    clearAuthMessage();
    clearFieldErrors();
}
loginTab.addEventListener("click", function () {
    updateAuthForm("login");
});
registerTab.addEventListener("click", function () {
    updateAuthForm("register");
});
/* =========================================
   13. AUTHENTICATION FORM VALIDATION
\========================================= */
function clearFieldErrors() {
    nameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    nameInput.classList.remove("invalid");
    emailInput.classList.remove("invalid");
    passwordInput.classList.remove("invalid");
}
function clearAuthMessage() {
    authMessage.textContent = "";
    authMessage.className = "auth-message";
}
function showFieldError(input, errorElement, message) {
    input.classList.add("invalid");
    errorElement.textContent = message;
}
function validateAuthForm() {
    clearFieldErrors();
    let valid = true;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (currentAuthMode === "register") {
        if (name.length < 2) {
            showFieldError(
                nameInput,
                nameError,
                "Please enter a name with at least 2 characters."
            );
            valid = false;
        }
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showFieldError(
            emailInput,
            emailError,
            "Please enter a valid email address."
        );
        valid = false;
    }
    if (password.length < 8 || password.length > 72) {
        showFieldError(
            passwordInput,
            passwordError,
            "Password must contain between 8 and 72 characters."
        );
        valid = false;
    }
    return valid;
}
authForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearAuthMessage();
    if (!validateAuthForm()) {
        authMessage.textContent =
            "Please correct the errors above and try again.";
        authMessage.classList.add("error");
        return;
    }
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const isRegister = currentAuthMode === "register";
    const endpoint = isRegister
        ? "/api/auth/register"
        : "/api/auth/login";
    const payload = isRegister
        ? { name, email, password }
        : { email, password };
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = "Please wait...";
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "The request failed.");
        }
        if (isRegister) {
            const successMessage =
                data.message || "Account created successfully. Please log in.";
            updateAuthForm("login");
            authMessage.textContent = successMessage;
            authMessage.classList.add("success");
            showToast(successMessage);
            passwordInput.value = "";
       } else {
    if (data.token) {
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem("authUser", (data.user && data.user.name) || "");
        updateAuthButtons();
        await loadAccountPlan();
        updateSelectedPlan();
    }
    authMessage.textContent = data.message || "Login successful.";
    authMessage.classList.add("success");
    showToast("Login successful!");
    passwordInput.value = "";
    setTimeout(() => {
        closeAuthModal();
    }, 1000);
}
    } catch (error) {
        console.error("Authentication error:", error);
        authMessage.textContent =
            error.message || "Unable to connect to the server. Please try again.";
        authMessage.classList.add("error");
        showToast(authMessage.textContent);
    } finally {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent =
            currentAuthMode === "register" ? "Create Account" : "Login";
    }
});
/* =========================================
   14. MOBILE NAVIGATION
\========================================= */
menuToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
});
function closeMenu() {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
}
navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
});
/* =========================================
   15. TOAST NOTIFICATIONS
\========================================= */
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer !== null) {
        clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(function () {
        toast.classList.remove("show");
        toastTimer = null;
    }, 3000);
}
/* =========================================
   16. KEYBOARD SUPPORT
\========================================= */
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (!detailsModal.hidden) {
            closeDetailsModal();
        } else if (!authModal.hidden) {
            closeAuthModal();
        } else {
            closeMenu();
        }
    }
});
/* =========================================
   17. INITIALIZE APPLICATION
\========================================= */
async function loadPlansFromServer() {
    // Use the database plans; keep the built-in list as offline fallback
    try {
        const res = await fetch("/api/policies");
        const data = await res.json();
        if (res.ok && Array.isArray(data.policies) && data.policies.length) {
            insurancePlans = data.policies;
        }
    } catch (err) {
        console.warn("Using built-in plans (API unavailable):", err);
    }
}

function updateAuthButtons() {
    const loggedIn = Boolean(sessionStorage.getItem("authToken"));
    const name = sessionStorage.getItem("authUser");
    loginBtn.textContent = loggedIn ? (name ? `Hi, ${name}` : "Logged in") : "Login";
    registerBtn.textContent = loggedIn ? "Logout" : "Register";
}

async function initializeApp() {
    await loadPlansFromServer();
    await loadAccountPlan();
    displayPolicies();
    updateSelectedPlan();
    updateAuthButtons();
    updateAuthForm("login");
    authModal.hidden = true;
    authModal.setAttribute("aria-hidden", "true");
    detailsModal.hidden = true;
    detailsModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    console.log("InsureCare application initialized successfully.");
}
initializeApp();
