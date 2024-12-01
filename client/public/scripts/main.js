class MinesweeperGame {
    constructor() {
        this.grid = document.getElementById('grid');
        this.timer = document.getElementById('timer');
        this.lastClickTime = 0;
        this.cooldownTime = 5 * 60 * 1000;
        this.cells = [];
        this.GRID_ROWS = 50;    // Height
        this.GRID_COLS = 100;   // Width
        this.modal = document.getElementById('instructionsModal');
        this.instructionsButton = document.querySelector('.instructions');
        this.setupInstructionsButton();
        
        this.init();
        this.API_URL = window.location.origin; // Use relative URL
    }

    init() {
        this.createGrid();
        this.startTimer();
        this.checkUserStatus(); // Check initial state
        this.setupStatusPolling();
        this.showInstructions(); // Show instructions on load
    }

    setupInstructionsButton() {
        this.instructionsButton.addEventListener('click', () => {
            this.showInstructions();
        });
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

    async handleClick(cell) {
        if (cell.classList.contains('revealed')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/api/click`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cellIndex: parseInt(cell.dataset.index)
                })
            });

            const data = await response.json();

            if (response.status === 429) {
                alert(data.error);
                return;
            }

            if (data.error) {
                alert(data.error);
                return;
            }

            if (data.success) {
                this.revealCell(cell, data.isWinner);
                this.lastClickTime = Date.now();

                if (data.isWinner && data.privateKey) {
                    this.handleWin(data.privateKey);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        }
    }

    revealCell(cell, isWinner) {
        cell.classList.add('revealed');
        if (isWinner) {
            cell.innerHTML = '❌';
            cell.classList.add('winner');
        } else {
            cell.classList.add('empty');
        }
    }

    handleWin(privateKey) {
        setTimeout(() => {
            alert(`Congratulations! You've found the winning cell!\nPrivate Key: ${privateKey}`);
        }, 500);
    }

    async checkUserStatus() {
        try {
            const response = await fetch(`${this.API_URL}/api/status`);
            const data = await response.json();
            
            this.lastClickTime = data.lastClickTime || 0;
            this.updateTimer();

            if (data.revealedCells) {
                data.revealedCells.forEach(cell => {
                    const cellElement = this.cells[cell.index];
                    if (cellElement && !cellElement.classList.contains('revealed')) {
                        this.revealCell(cellElement, cell.isWinner);
                    }
                });
            }
        } catch (error) {
            console.error('Error checking status:', error);
        }
    }

    setupStatusPolling() {
        setInterval(() => this.checkUserStatus(), 2000);
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

    showInstructions() {
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
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