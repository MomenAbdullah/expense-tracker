const API_URL = "http://localhost:3000/api/expenses";

let expenses = [];

const expenseForm = document.getElementById("expenseForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");

const expenseTableBody = document.getElementById("expenseTableBody");

const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const highestExpense = document.getElementById("highestExpense");

const loadingSpinner = document.getElementById("loadingSpinner");
const alertContainer = document.getElementById("alertContainer");

const editForm = document.getElementById("editForm");
const editId = document.getElementById("editId");
const editTitle = document.getElementById("editTitle");
const editAmount = document.getElementById("editAmount");
const editCategory = document.getElementById("editCategory");
const editDate = document.getElementById("editDate");

const editModalElement = document.getElementById("editModal");

const themeToggle = document.getElementById("themeToggle");

const editModal = new bootstrap.Modal(editModalElement);

async function loadExpenses() {
  loadingSpinner.classList.remove("d-none");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load expenses.");
    }

    expenses = await response.json();

    updateSummary();

    renderExpenses();
  } catch (error) {
    showAlert(
      "Unable to load expenses. Please make sure the server is running.",
      "danger",
    );
  } finally {
    loadingSpinner.classList.add("d-none");
  }
}

function updateSummary() {
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const count = expenses.length;

  const highest =
    expenses.length > 0
      ? Math.max(...expenses.map((expense) => Number(expense.amount)))
      : 0;

  totalAmount.textContent = `$${total.toFixed(2)}`;

  expenseCount.textContent = count;

  highestExpense.textContent = `$${highest.toFixed(2)}`;
}

function renderExpenses() {
  const selectedCategory = categoryFilter.value;

  const searchText = searchInput.value.trim().toLowerCase();

  let filteredExpenses = expenses;

  if (selectedCategory !== "All") {
    filteredExpenses = filteredExpenses.filter(
      (expense) => expense.category === selectedCategory,
    );
  }

  if (searchText !== "") {
    filteredExpenses = filteredExpenses.filter((expense) =>
      expense.title.toLowerCase().includes(searchText),
    );
  }

  expenseTableBody.innerHTML = "";

  if (filteredExpenses.length === 0) {
    expenseTableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center text-muted"
                >
                    No expenses found.
                </td>
            </tr>
        `;

    return;
  }

  filteredExpenses.forEach((expense) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>
                ${escapeHtml(expense.title)}
            </td>

            <td>
                $${Number(expense.amount).toFixed(2)}
            </td>

            <td>
                <span class="badge bg-primary">
                    ${escapeHtml(expense.category)}
                </span>
            </td>

            <td>
                ${escapeHtml(expense.date)}
            </td>

            <td class="action-buttons">

                <button
                    class="btn btn-sm btn-warning me-1"
                    onclick="openEditModal(${expense.id})"
                >
                    Edit
                </button>

                <button
                    class="btn btn-sm btn-danger"
                    onclick="deleteExpense(${expense.id})"
                >
                    Delete
                </button>

            </td>
        `;

    expenseTableBody.appendChild(row);
  });
}

expenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = titleInput.value.trim();

  const amount = Number(amountInput.value);

  const category = categoryInput.value;

  const date = dateInput.value;

  if (title === "") {
    showAlert("Title is required.", "danger");

    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showAlert("Amount must be greater than 0.", "danger");

    return;
  }

  if (category === "") {
    showAlert("Please select a category.", "danger");

    return;
  }

  if (date === "") {
    showAlert("Date is required.", "danger");

    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title,
        amount,
        category,
        date,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add expense.");
    }

    showAlert("Expense added successfully.", "success");

    expenseForm.reset();

    await loadExpenses();
  } catch (error) {
    showAlert(error.message || "Unable to add expense.", "danger");
  }
});

async function deleteExpense(id) {
  const confirmed = confirm("Are you sure you want to delete this expense?");

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete expense.");
    }

    showAlert("Expense deleted successfully.", "success");

    await loadExpenses();
  } catch (error) {
    showAlert(error.message || "Unable to delete expense.", "danger");
  }
}

categoryFilter.addEventListener("change", renderExpenses);

searchInput.addEventListener("input", renderExpenses);

function openEditModal(id) {
  const expense = expenses.find((expense) => expense.id === id);

  if (!expense) {
    showAlert("Expense not found.", "danger");

    return;
  }

  editId.value = expense.id;

  editTitle.value = expense.title;

  editAmount.value = expense.amount;

  editCategory.value = expense.category;

  editDate.value = expense.date;

  editModal.show();
}

editForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const id = Number(editId.value);

  const title = editTitle.value.trim();

  const amount = Number(editAmount.value);

  const category = editCategory.value;

  const date = editDate.value;

  if (title === "") {
    showAlert("Title is required.", "danger");

    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showAlert("Amount must be greater than 0.", "danger");

    return;
  }

  if (category === "") {
    showAlert("Please select a category.", "danger");

    return;
  }

  if (date === "") {
    showAlert("Date is required.", "danger");

    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title,
        amount,
        category,
        date,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update expense.");
    }

    showAlert("Expense updated successfully.", "success");

    editModal.hide();

    await loadExpenses();
  } catch (error) {
    showAlert(error.message || "Unable to update expense.", "danger");
  }
});

function showAlert(message, type) {
  alertContainer.innerHTML = `
        <div
            class="alert alert-${type} alert-dismissible fade show"
            role="alert"
        >

            ${escapeHtml(message)}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
            ></button>

        </div>
    `;
}

function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}

function updateThemeButton() {
  if (document.body.classList.contains("dark-mode")) {
    themeToggle.textContent = "Light Mode";
  } else {
    themeToggle.textContent = "Dark Mode";
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");

  const isDarkMode = document.body.classList.contains("dark-mode");

  localStorage.setItem("darkMode", isDarkMode);

  updateThemeButton();
}

function loadTheme() {
  const savedTheme = localStorage.getItem("darkMode");

  if (savedTheme === "true") {
    document.body.classList.add("dark-mode");
  }

  updateThemeButton();
}

themeToggle.addEventListener("click", toggleDarkMode);

loadTheme();

loadExpenses();
