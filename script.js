// ============================================================
// By Cleidson Neves - 10/09/2025 - Projeto Baby Dev - DevClub
// ============================================================
// =============================================
// SELEÇÃO DE ELEMENTOS DOM
// =============================================

// Formulário para adicionar novas tarefas
const taskForm = document.getElementById('task-form');
// Input de texto da tarefa
const taskInput = document.getElementById('task-input');
// Select de prioridade da tarefa
const taskPriority = document.getElementById('task-priority');
// Input de data da tarefa
const taskDate = document.getElementById('task-date');
// Lista onde as tarefas serão exibidas
const tasksList = document.getElementById('tasks-list');
// Elemento que aparece quando não há tarefas
const emptyState = document.getElementById('empty-state');
// Botão para alternar entre modo claro e escuro
const themeToggle = document.getElementById('theme-toggle');
// Elemento que mostra a contagem de tarefas
const tasksCount = document.getElementById('tasks-count');
// Botão para limpar tarefas concluídas
const clearCompletedBtn = document.getElementById('clear-completed');
// Todos os botões de filtro
const filterButtons = document.querySelectorAll('.filter-btn');

// =============================================
// ESTADO DA APLICAÇÃO
// =============================================

// Array que armazena todas as tarefas
// Tenta carregar do localStorage ou inicia vazio
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
// Filtro atual ('all', 'active', ou 'completed')
let currentFilter = 'all';

// =============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =============================================

// Quando o DOM estiver totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se há preferência de tema salva
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
    
    // Renderiza as tarefas na interface
    renderTasks();
    // Atualiza o contador de tarefas
    updateTasksCount();
    
    // Define a data mínima como hoje para o input de data
    const today = new Date().toISOString().split('T')[0];
    taskDate.min = today;
});

// =============================================
// EVENT LISTENERS
// =============================================

// Evento de submit do formulário de nova tarefa
taskForm.addEventListener('submit', addTask);
// Evento de clique no botão de alternar tema
themeToggle.addEventListener('click', toggleTheme);
// Evento de clique no botão de limpar tarefas concluídas
clearCompletedBtn.addEventListener('click', clearCompletedTasks);

// Adiciona event listeners para todos os botões de filtro
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove a classe 'active' de todos os botões
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Adiciona a classe 'active' ao botão clicado
        button.classList.add('active');
        // Atualiza o filtro atual com o valor do data-filter do botão
        currentFilter = button.dataset.filter;
        // Renderiza as tarefas com o novo filtro
        renderTasks();
    });
});

// =============================================
// FUNÇÕES PRINCIPAIS
// =============================================

/**
 * Adiciona uma nova tarefa à lista
 * @param {Event} e - Evento de submit do formulário
 */
function addTask(e) {
    // Previne o comportamento padrão do formulário (recarregar a página)
    e.preventDefault();
    
    // Obtém e limpa o texto da tarefa
    const text = taskInput.value.trim();
    // Se não houver texto, não faz nada
    if (!text) return;
    
    // Cria um objeto representando a nova tarefa
    const newTask = {
        id: Date.now(), // ID único baseado no timestamp
        text,           // Texto da tarefa
        priority: taskPriority.value, // Prioridade
        date: taskDate.value,         // Data (se existir)
        completed: false,             // Estado de conclusão
        createdAt: new Date().toISOString() // Data de criação
    };
    
    // Adiciona a nova tarefa no início do array
    tasks.unshift(newTask);
    // Salva as tarefas no localStorage
    saveTasks();
    // Renderiza as tarefas na interface
    renderTasks();
    // Atualiza o contador
    updateTasksCount();
    
    // Reseta o formulário
    taskInput.value = '';
    taskPriority.value = 'medium';
    taskDate.value = '';
    // Coloca o foco de volta no input de texto
    taskInput.focus();
}

/**
 * Renderiza a lista de tarefas na interface
 * Aplica os filtros conforme necessário
 */
function renderTasks() {
    // Inicia com todas as tarefas
    let filteredTasks = tasks;
    
    // Aplica filtros conforme o filtro atual
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Mostra ou esconde o estado vazio dependendo se há tarefas
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
        tasksList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tasksList.style.display = 'flex';
    }
    
    // Limpa a lista atual
    tasksList.innerHTML = '';
    
    // Para cada tarefa filtrada, cria um elemento e adiciona à lista
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

/**
 * Cria um elemento DOM para representar uma tarefa
 * @param {Object} task - Objeto da tarefa
 * @returns {HTMLElement} Elemento DOM da tarefa
 */
function createTaskElement(task) {
    // Cria o elemento li que representará a tarefa
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'task-completed' : ''}`;
    li.dataset.id = task.id; // Armazena o ID no elemento para referência futura
    
    // Cria o checkbox para marcar/desmarcar conclusão
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    // Adiciona evento para alternar o estado de conclusão
    checkbox.addEventListener('change', () => toggleTaskCompleted(task.id));
    
    // Cria o container do conteúdo da tarefa
    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';
    
    // Cria o parágrafo com o texto da tarefa
    const textP = document.createElement('p');
    textP.className = 'task-text';
    textP.textContent = task.text;
    
    contentDiv.appendChild(textP);
    
    // Se a tarefa tiver uma data, adiciona um elemento para exibi-la
    if (task.date) {
        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        dateSpan.textContent = formatDate(task.date);
        contentDiv.appendChild(dateSpan);
    }
    
    // Cria o indicador de prioridade
    const prioritySpan = document.createElement('span');
    prioritySpan.className = `task-priority priority-${task.priority}`;
    
    // Texto amigável para a prioridade
    let priorityText = '';
    switch(task.priority) {
        case 'low':
            priorityText = 'Baixa';
            break;
        case 'medium':
            priorityText = 'Média';
            break;
        case 'high':
            priorityText = 'Alta';
            break;
    }
    
    prioritySpan.textContent = priorityText;
    
    // Cria o container para as ações (botões)
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    
    // Cria o botão de deletar
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn btn-delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    // Adiciona os elementos de ação ao container
    actionsDiv.appendChild(prioritySpan);
    actionsDiv.appendChild(deleteBtn);
    
    // Monta a estrutura completa do elemento da tarefa
    li.appendChild(checkbox);
    li.appendChild(contentDiv);
    li.appendChild(actionsDiv);
    
    return li;
}

/**
 * Alterna o estado de conclusão de uma tarefa
 * @param {number} id - ID da tarefa a ser alterada
 */
function toggleTaskCompleted(id) {
    // Percorre todas as tarefas
    tasks = tasks.map(task => {
        // Quando encontra a tarefa com o ID correspondente
        if (task.id === id) {
            // Retorna uma cópia da tarefa com o estado de conclusão invertido
            return { ...task, completed: !task.completed };
        }
        // Para outras tarefas, retorna sem alterações
        return task;
    });
    
    // Salva as alterações
    saveTasks();
    // Re-renderiza a lista
    renderTasks();
    // Atualiza o contador
    updateTasksCount();
}

/**
 * Remove uma tarefa da lista
 * @param {number} id - ID da tarefa a ser removida
 */
function deleteTask(id) {
    // Filtra o array, mantendo apenas tarefas com ID diferente do especificado
    tasks = tasks.filter(task => task.id !== id);
    // Salva as alterações
    saveTasks();
    // Re-renderiza a lista
    renderTasks();
    // Atualiza o contador
    updateTasksCount();
}

/**
 * Remove todas as tarefas concluídas
 */
function clearCompletedTasks() {
    // Filtra o array, mantendo apenas tarefas não concluídas
    tasks = tasks.filter(task => !task.completed);
    // Salva as alterações
    saveTasks();
    // Re-renderiza a lista
    renderTasks();
    // Atualiza o contador
    updateTasksCount();
}

/**
 * Atualiza o contador de tarefas na interface
 */
function updateTasksCount() {
    // Total de tarefas
    const totalTasks = tasks.length;
    // Tarefas concluídas
    const completedTasks = tasks.filter(task => task.completed).length;
    // Tarefas ativas (não concluídas)
    const activeTasks = totalTasks - completedTasks;
    
    // Atualiza o texto do contador
    tasksCount.textContent = `${activeTasks} tarefa(s) restante(s)`;
}

/**
 * Alterna entre modo claro e escuro
 */
function toggleTheme() {
    // Alterna a classe dark-mode no body
    document.body.classList.toggle('dark-mode');
    
    // Atualiza o ícone e salva a preferência
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Salva as tarefas no localStorage
 */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Formata uma data para exibição amigável
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    // Converte a string para objeto Date
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Formata para dd/mm/aaaa
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Verifica se é hoje
    if (date.toDateString() === today.toDateString()) {
        return `Hoje - ${day}/${month}/${year}`;
    }
    
    // Verifica se é amanhã
    if (date.toDateString() === tomorrow.toDateString()) {
        return `Amanhã - ${day}/${month}/${year}`;
    }
    
    // Data normal
    return `${day}/${month}/${year}`;
}