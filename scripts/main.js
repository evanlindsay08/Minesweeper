class MinesweeperGame {
    constructor() {
        this.grid = document.getElementById('grid');
        this.timer = document.getElementById('timer');
        this.modal = document.getElementById('instructionsModal');
        this.instructionsButton = document.querySelector('.instructions');
        this.lastClickTime = 0;
        this.cooldownTime = 5 * 60 * 1000;
        this.cells = [];
        this.GRID_ROWS = 50;
        this.GRID_COLS = 100;
        this.revealedCells = new Set();
        this.simulationSpeed = 500; // Time between auto-clicks in milliseconds
        
        this.init();
    }

    init() {
        this.createGrid();
        this.setupInstructionsButton();
        this.showInstructions();
        this.startTimer();
        this.startSimulation(); // Start the auto-clicking simulation
    }

    startSimulation() {
        setInterval(() => {
            this.simulateRandomClick();
        }, this.simulationSpeed);
    }

    simulateRandomClick() {
        // Generate random row and column
        const row = Math.floor(Math.random() * this.GRID_ROWS);
        const col = Math.floor(Math.random() * this.GRID_COLS);
        const index = row * this.GRID_COLS + col;

        // Get the cell at this position
        const cell = this.cells[index];

        // Only click if cell exists and hasn't been revealed
        if (cell && !cell.classList.contains('revealed')) {
            // Add a small random delay to make it look more natural
            setTimeout(() => {
                this.revealCell(cell, false);
            }, Math.random() * 200);
        }
    }

    revealCell(cell, isWinner) {
        if (cell.classList.contains('revealed')) {
            return;
        }

        cell.classList.add('revealed');
        if (isWinner) {
            cell.innerHTML = '❌';
            cell.classList.add('winner');
        } else {
            cell.classList.add('empty');
        }
    }

    createGrid() {
        this.grid.innerHTML = '';
        this.cells = [];

        for (let i = 0; i < this.GRID_ROWS; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < this.GRID_COLS; j++) {
                const cell = document.createElement('td');
                cell.className = 'cell';
                const index = i * this.GRID_COLS + j;
                cell.dataset.index = index;
                cell.addEventListener('click', () => this.handleClick(cell));
                row.appendChild(cell);
                this.cells.push(cell);
            }
            this.grid.appendChild(row);
        }
    }

    handleClick(cell) {
        if (cell.classList.contains('revealed')) {
            return;
        }

        const now = Date.now();
        const timeSinceLastClick = now - this.lastClickTime;
        
        if (this.lastClickTime && timeSinceLastClick < this.cooldownTime) {
            const remainingTime = this.cooldownTime - timeSinceLastClick;
            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            alert(`Please wait ${minutes}m ${seconds}s before clicking again`);
            return;
        }

        this.revealCell(cell, false);
        this.lastClickTime = now;
    }

    setupInstructionsButton() {
        this.instructionsButton.addEventListener('click', () => {
            this.showInstructions();
        });
    }

    showInstructions() {
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    startTimer() {
        this.updateTimer();
        setInterval(() => this.updateTimer(), 1000);
    }

    updateTimer() {
        const now = Date.now();
        const timeSinceLastClick = now - this.lastClickTime;
        
        if (timeSinceLastClick >= this.cooldownTime || !this.lastClickTime) {
            this.timer.textContent = 'Click any square!';
            return;
        }

        const timeLeft = this.cooldownTime - timeSinceLastClick;
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        
        this.timer.textContent = `Next click: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new MinesweeperGame();
});

window.closeModal = () => {
    if (window.game) {
        window.game.closeModal();
    }
};