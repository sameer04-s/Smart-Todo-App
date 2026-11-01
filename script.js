// Select HTML elements
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed-btn");
const themeToggle = document.getElementById("theme-toggle");
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const completedList = document.getElementById("completed-list");
const activeEmpty = document.getElementById("active-empty");
const completedEmpty = document.getElementById("completed-empty");
const progressBar = document.querySelector(".progress-bar");

let currentFilter = "all";

// Create a task and attach its actions
function createTask(text, isCompleted = false, position = "top") {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");

    const taskContent = document.createElement("div");
    taskContent.classList.add("task-content");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");
    checkbox.checked = isCompleted;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    const taskText = document.createElement("span");
    taskText.classList.add("task-text");
    taskText.textContent = text;

    const taskActions = document.createElement("div");
    taskActions.classList.add("task-actions");

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.type = "button";
    editBtn.textContent = "✏️";
    editBtn.setAttribute("aria-label", "Edit task");
    editBtn.title = "Edit task";

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.type = "button";
    deleteBtn.textContent = "🗑️";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.title = "Delete task";

    taskContent.append(checkbox, taskText);
    taskActions.append(editBtn, deleteBtn);
    taskItem.append(taskContent, taskActions);

    if (isCompleted) {
        taskItem.classList.add("completed");
    }

    const targetList = isCompleted ? completedList : taskList;

    if (position === "top") {
        targetList.prepend(taskItem);
    } else {
        targetList.append(taskItem);
    }

    // Complete or reactivate a task
    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            taskItem.classList.add("completed");
            completedList.prepend(taskItem);
        } else {
            taskItem.classList.remove("completed");
            taskList.prepend(taskItem);
        }

        updateTaskStats();
        saveTasks();
        filterTasks();
    });

    // Edit a task
    editBtn.addEventListener("click", () => {
        const updatedTask = prompt("Edit your task:", taskText.textContent);

        if (updatedTask === null) return;

        const newText = updatedTask.trim();

        if (!newText) {
            alert("Task cannot be empty!");
            return;
        }

        taskText.textContent = newText;
        saveTasks();
        filterTasks();
    });

    // Delete a task
    deleteBtn.addEventListener("click", () => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        taskItem.remove();
        updateTaskStats();
        saveTasks();
        filterTasks();
    });

    return taskItem;
}

// Add a new task
function addTask() {
    const text = taskInput.value.trim();

    if (!text) {
        alert("Please enter a task!");
        taskInput.focus();
        return;
    }

    createTask(text, false, "top");
    taskInput.value = "";
    updateTaskStats();
    saveTasks();
    filterTasks();
    taskInput.focus();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
});

// Update task counts, progress, and empty-state messages
function updateTaskStats() {
    const total = document.querySelectorAll(".task-item").length;
    const completed = document.querySelectorAll(".task-item.completed").length;
    const active = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("total-tasks").textContent = total;
    document.getElementById("active-tasks").textContent = active;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("progress-percentage").textContent = `${percentage}%`;
    document.getElementById("progress-fill").style.width = `${percentage}%`;

    progressBar.setAttribute("aria-valuenow", percentage);

    const message = document.getElementById("progress-message");

    if (total === 0) {
        message.textContent = "Start adding your tasks!";
    } else if (percentage === 100) {
        message.textContent = "Amazing! All tasks completed!";
    } else if (percentage >= 50) {
        message.textContent = "Great progress! Keep going!";
    } else {
        message.textContent = "Keep going! You can do it!";
    }

    activeEmpty.style.display = active === 0 ? "block" : "none";
    completedEmpty.style.display = completed === 0 ? "block" : "none";
}

// Save active and completed tasks to Local Storage
function saveTasks() {
    const tasks = [];

    taskList.querySelectorAll(".task-item").forEach((task) => {
        tasks.push({
            text: task.querySelector(".task-text").textContent,
            completed: false
        });
    });

    completedList.querySelectorAll(".task-item").forEach((task) => {
        tasks.push({
            text: task.querySelector(".task-text").textContent,
            completed: true
        });
    });

    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

// Restore saved tasks from Local Storage
function loadTasks() {
    const savedData = localStorage.getItem("todoTasks");

    if (!savedData) {
        updateTaskStats();
        return;
    }

    try {
        const savedTasks = JSON.parse(savedData);

        if (!Array.isArray(savedTasks)) {
            throw new Error("Invalid saved task data");
        }

        savedTasks.forEach((task) => {
            if (
                task &&
                typeof task.text === "string" &&
                task.text.trim() !== "" &&
                typeof task.completed === "boolean"
            ) {
                createTask(task.text, task.completed, "bottom");
            }
        });
    } catch (error) {
        console.error("Error loading tasks:", error);
    }

    updateTaskStats();
}

// Apply and save the selected color theme
function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);
    themeToggle.textContent = isDark ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    localStorage.setItem("todoTheme", isDark ? "dark" : "light");
}

const savedTheme = localStorage.getItem("todoTheme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";

    applyTheme(nextTheme);
});

// Filter tasks by status and search text
function filterTasks() {
    const searchText = searchInput.value.toLowerCase().trim();

    document.querySelectorAll(".task-item").forEach((task) => {
        const text = task.querySelector(".task-text").textContent.toLowerCase();
        const isCompleted = task.classList.contains("completed");

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !isCompleted) ||
            (currentFilter === "completed" && isCompleted);

        const matchesSearch = text.includes(searchText);

        task.style.display = matchesFilter && matchesSearch ? "flex" : "none";
    });
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach((filterButton) => {
            filterButton.classList.remove("active");
        });

        button.classList.add("active");
        filterTasks();
    });
});

searchInput.addEventListener("input", filterTasks);

// Remove all completed tasks
clearCompletedBtn.addEventListener("click", () => {
    const completedTasks = completedList.querySelectorAll(".task-item");

    if (completedTasks.length === 0) {
        alert("No completed tasks to clear!");
        return;
    }

    if (!confirm("Are you sure you want to clear all completed tasks?")) return;

    completedTasks.forEach((task) => task.remove());

    updateTaskStats();
    saveTasks();
    filterTasks();
});

// Start the application
loadTasks();
filterTasks();