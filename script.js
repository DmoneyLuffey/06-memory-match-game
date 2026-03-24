// ========================================
// Emoji Memory Match Game - JavaScript
// ========================================

// All the emojis used in the game (8 pairs = 16 cards total)
const EMOJIS = ['🍕', '🍕', '🍔', '🍔', '🍎', '🍎', '🍰', '🍰', '🌮', '🌮', '🍩', '🍩', '🍦', '🍦', '🎂', '🎂'];

// ========================================
// Game State Object
// Stores all the current game information
// ========================================

const gameState = {
    cards: [],              // Array of card objects
    firstCard: null,        // First card selected by player
    secondCard: null,       // Second card selected by player
    lockBoard: false,       // Prevents clicking while checking for matches
    moves: 0,               // Number of moves made
    matchedPairs: 0,        // Number of pairs successfully matched
    totalMatches: 8,        // Total pairs in game
    timerStarted: false,    // Has timer been started?
    timerInterval: null,    // Reference to timer for cleanup
    elapsedTime: 0,         // Time in seconds
};

// ========================================
// Game Initialization
// ========================================

// Function: Initialize the game when page loads
function initializeGame() {
    // Create card objects from emojis
    gameState.cards = EMOJIS.map(function(emoji, index) {
        return {
            id: index,
            emoji: emoji,
            isFlipped: false,
            isMatched: false,
        };
    });

    // Shuffle the cards randomly
    gameState.cards = shuffleCards(gameState.cards);

    // Render the cards on the page
    renderBoard();

    // Update display to show initial state
    updateStats();
}

// ========================================
// Shuffling Algorithm (Fisher-Yates)
// Randomly arranges cards
// ========================================

function shuffleCards(cardsArray) {
    // Create a copy of the array to avoid modifying original
    const shuffled = [...cardsArray];

    // Loop from the end of the array to the beginning
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Generate random index
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap current card with card at random index
        const temp = shuffled[i];
        shuffled[i] = shuffled[randomIndex];
        shuffled[randomIndex] = temp;
    }

    return shuffled;
}

// ========================================
// Rendering Functions
// ========================================

// Function: Create and display all cards on the board
function renderBoard() {
    const gameBoard = document.querySelector('#game-board');

    // Clear previous cards
    gameBoard.innerHTML = '';

    // Create a card element for each card in gameState
    for (let i = 0; i < gameState.cards.length; i++) {
        const card = gameState.cards[i];
        const cardElement = document.createElement('div');

        // Add card class
        cardElement.classList.add('card');

        // If card is already flipped or matched, add those classes
        if (card.isFlipped || card.isMatched) {
            cardElement.classList.add('flipped');
        }
        if (card.isMatched) {
            cardElement.classList.add('matched');
        }

        // Add disabled class to prevent clicking matched cards
        if (card.isMatched) {
            cardElement.classList.add('disabled');
        }

        // Set the card's HTML structure (front and back)
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${card.emoji}</div>
            </div>
        `;

        // Add click event listener to the card
        cardElement.addEventListener('click', function() {
            handleCardClick(card, cardElement);
        });

        // Add the card to the game board
        gameBoard.appendChild(cardElement);
    }
}

// ========================================
// Card Click Handler
// ========================================

// Function: Handle when a card is clicked
function handleCardClick(card, cardElement) {
    // Return early if:
    // - Board is locked (checking for match)
    // - Card is already matched
    // - Card is already flipped in this turn
    if (gameState.lockBoard || card.isMatched || card.isFlipped) {
        return;
    }

    // Start the timer on first card flip
    if (!gameState.timerStarted) {
        startTimer();
        gameState.timerStarted = true;
    }

    // Flip the card
    card.isFlipped = true;
    cardElement.classList.add('flipped');

    // If this is the first card of the pair
    if (gameState.firstCard === null) {
        gameState.firstCard = card;
    }
    // If this is the second card of the pair
    else {
        gameState.secondCard = card;

        // Increment move counter (move = 2 card flips)
        gameState.moves++;
        updateStats();

        // Lock the board to prevent further clicks
        gameState.lockBoard = true;

        // Check if the cards match after a short delay
        setTimeout(function() {
            checkForMatch();
        }, 600);
    }
}

// ========================================
// Match Checking
// ========================================

// Function: Check if two flipped cards match
function checkForMatch() {
    // Check if emojis are the same
    const isMatch = gameState.firstCard.emoji === gameState.secondCard.emoji;

    if (isMatch) {
        // Cards match!
        handleMatchedCards();
    } else {
        // Cards don't match, flip them back
        handleUnmatchedCards();
    }
}

// Function: Handle when cards match
function handleMatchedCards() {
    // Mark cards as matched
    gameState.firstCard.isMatched = true;
    gameState.secondCard.isMatched = true;

    // Increase matched pairs count
    gameState.matchedPairs++;

    // Update the display
    updateStats();

    // Re-render to show matched state
    renderBoard();

    // Reset the selected cards
    resetTurn();

    // Check if game is won
    if (gameState.matchedPairs === gameState.totalMatches) {
        endGame();
    }
}

// Function: Handle when cards don't match
function handleUnmatchedCards() {
    // Flip the cards back by removing the flipped class
    gameState.firstCard.isFlipped = false;
    gameState.secondCard.isFlipped = false;

    // Re-render to show flipped state
    renderBoard();

    // Reset the selected cards
    resetTurn();
}

// Function: Reset the turn after checking for match
function resetTurn() {
    gameState.firstCard = null;
    gameState.secondCard = null;
    gameState.lockBoard = false;
}

// ========================================
// Timer Function
// ========================================

// Function: Start the game timer
function startTimer() {
    gameState.timerInterval = setInterval(function() {
        gameState.elapsedTime++;
        updateStats();
    }, 1000);
}

// Function: Stop the game timer
function stopTimer() {
    if (gameState.timerInterval !== null) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// ========================================
// Update Display
// ========================================

// Function: Update game statistics display
function updateStats() {
    // Update moves counter
    const movesElement = document.querySelector('#moves-count');
    movesElement.textContent = gameState.moves;

    // Update matches counter
    const matchesElement = document.querySelector('#matches-count');
    matchesElement.textContent = gameState.matchedPairs + '/' + gameState.totalMatches;

    // Update time counter
    const timeElement = document.querySelector('#time-count');
    timeElement.textContent = gameState.elapsedTime + 's';
}

// ========================================
// Game End
// ========================================

// Function: Handle when player wins
function endGame() {
    // Stop the timer
    stopTimer();

    // Show final stats in modal
    const finalMovesElement = document.querySelector('#final-moves');
    finalMovesElement.textContent = gameState.moves;

    const finalTimeElement = document.querySelector('#final-time');
    finalTimeElement.textContent = gameState.elapsedTime + 's';

    // Save best score to localStorage
    saveBestScore();

    // Show win modal
    const winModal = document.querySelector('#win-modal');
    winModal.classList.add('show');
}

// ========================================
// Local Storage for Best Score
// ========================================

// Function: Save best score to browser storage
function saveBestScore() {
    // Get the current best score from localStorage
    let bestScore = localStorage.getItem('memoryGameBestScore');

    // Create score object for this game
    const currentScore = {
        moves: gameState.moves,
        time: gameState.elapsedTime,
    };

    // If no best score exists, save this one
    if (bestScore === null) {
        localStorage.setItem('memoryGameBestScore', JSON.stringify(currentScore));
    } else {
        // Parse the saved best score
        bestScore = JSON.parse(bestScore);

        // If current score is better (fewer moves), update it
        if (gameState.moves < bestScore.moves) {
            localStorage.setItem('memoryGameBestScore', JSON.stringify(currentScore));
        }
    }
}

// ========================================
// Restart Game
// ========================================

// Function: Reset the game to its initial state
function restartGame() {
    // Stop the timer
    stopTimer();

    // Reset game state
    gameState.cards = [];
    gameState.firstCard = null;
    gameState.secondCard = null;
    gameState.lockBoard = false;
    gameState.moves = 0;
    gameState.matchedPairs = 0;
    gameState.timerStarted = false;
    gameState.elapsedTime = 0;

    // Hide win modal if it's visible
    const winModal = document.querySelector('#win-modal');
    winModal.classList.remove('show');

    // Reinitialize the game
    initializeGame();
}

// ========================================
// Event Listeners
// ========================================

// Wait for page to load before starting
document.addEventListener('DOMContentLoaded', function() {
    // Initialize game when page loads
    initializeGame();

    // Restart button
    const restartBtn = document.querySelector('#restart-btn');
    restartBtn.addEventListener('click', restartGame);

    // Play Again button (in win modal)
    const playAgainBtn = document.querySelector('#play-again-btn');
    playAgainBtn.addEventListener('click', restartGame);
});
