document.addEventListener('DOMContentLoaded', function () {
  const drawCardBtn = document.getElementById('drawCardBtn');
  const playerHandDiv = document.getElementById('playerHand');
  const gameboard = document.getElementById('gameboard');
  
  let deck = generateDeck();
  let playerHand = [];
  let selectedCardIndex = null;
  const lockedCells = new Set([
    0, 1, 2, 3, 4, 5,        
     43, 44, 45, 46, 47, 48, 
    7, 14, 21, 28, 35,          
    13, 20, 27, 34, 41         
  ]);
  const placementOrder = [
    42, 43, 44, 45, 46, 47, 48,
    35, 36, 37, 38, 39, 40, 41,
    28, 29, 30, 31, 32, 33, 34,
    21, 22, 23, 24, 25, 26, 27,
    14, 15, 16, 17, 18, 19, 20,
    7,  8,  9, 10, 11, 12, 13,
    0,  1,  2,  3,  4,  5,  6
  ];
  const startCell = new Set([42])
  const finishCell = new Set([6])

  let drawCards = true;
  let isStartcard = false;



  // Render  hand
  function renderHand() {
    playerHandDiv.innerHTML = '';  // Clear  previous hand
    
    playerHand.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.classList.add('card');
      cardEl.textContent = card; // Set card value

      if (selectedCardIndex === index) {
        cardEl.classList.add('selected');
      }
      cardEl.addEventListener('click', () => {
        
        if (selectedCardIndex === index) {
          selectedCardIndex = null; // Deselect if already selected
        } else {
          selectedCardIndex = index;
        }
        renderHand(); // Refresh hand display to show selection
      });
      playerHandDiv.appendChild(cardEl);
    });
  }

  function createBoard() {
    for (let i = 0; i < 49; i++) {  
      const box = document.createElement('div');
      box.classList.add('grid-box');
      box.dataset.index = i;

                                                  // === Section 1: Add Cell Styling ===
      if(lockedCells.has(i)){
        box.classList.add('locked');
      }else{
        if(startCell.has(i)){
          box.classList.add('start');
        }
        if(finishCell.has(i)){
          box.classList.add('finish');
        }
                                                  // === Section 2: Handle Click Events ===
        box.addEventListener('click', () => {
        const card = playerHand[selectedCardIndex];
        const index = parseInt(box.dataset.index);
        
                                                    // --- Validate Special Card Placement ---

        if (card === "S" && !startCell.has(index)&&selectedCardIndex !== null) {
          alert("Start cards can only be placed on the start cell.");
          cancelSelection();
          return;
        }
        if (card !== "S" && startCell.has(index)&&selectedCardIndex !== null) {
          alert("Only start cards can go in the start cell.");
          cancelSelection();
          return;
        }

        if (card === "F" && !finishCell.has(index)&&selectedCardIndex !== null) {
          alert("Finish cards can only be placed on the finish cell.");
          cancelSelection();
          return;
        }
        if (card !== "F" && finishCell.has(index)&&selectedCardIndex !== null) {
          alert("Only finish cards can go in the finish cell.");
          cancelSelection();
          return;
        }
                                                                 // --- Valid Drop ---
        if (selectedCardIndex !== null && box.textContent === '') {
          box.textContent = card;
          playerHand.splice(selectedCardIndex, 1); 
          selectedCardIndex = null;
          renderHand();
          drawCards=false;

                                                                   // --- Handle Numbered Card Logic ---
          if (!isNaN(parseInt(card))) {
           

            const undo = () => {
              box.textContent = '';
              //playerHand.splice(playerHand.length, 0, card);

              playerHand.push(card); // add card back at the end
              renderHand();
            };

            if (!isValidOrderedPlacement(index, parseInt(card))) {
              alert("Card must be greater than all previous values.");
              undo();
              return;
            }
            payCards(index, parseInt(card), undo);

          }}
        
      });
      }

      gameboard.appendChild(box);
    }
    function cancelSelection() {
      selectedCardIndex = null;
      renderHand();
    }
  }
  //check valid card drop
  function isValidOrderedPlacement(index, cardValue) {
    const intendedPos = placementOrder.indexOf(index);
  
    for (let i = 0; i < intendedPos; i++) {
      const idx = placementOrder[i];
      const val = parseInt(gameboard.children[idx].textContent);
      if (!isNaN(val) && cardValue <= val) return false;
    }
    return true;
  }
  //aftercard drop
  function payCards(index, value, undo){
    const neighbors = [];

    const left = (index % 7 !== 0) ? index - 1 : null;
    const right = (index % 7 !== 6) ? index + 1 : null;

    [left, right].forEach((i) => {
      if (i !== null && i >= 0 && i < 49) {
        const cell = gameboard.children[i];
        const cellValue = parseInt(cell.textContent);
        if (!isNaN(cellValue)) {
          neighbors.push(Math.abs(value - cellValue));
        }
      }
    });
    if (neighbors.length === 0) return;

    const payment = Math.min(...neighbors);

    if (playerHand.length < payment) {
      alert(`You must discard ${payment} cards, but only have ${playerHand.length}. Game over or backtrack.`);
      undo();
      return;
    }
    showDiscardPrompt(payment,null,undo);
    renderHand();
  }

  function showDiscardPrompt(payment, onSuccess, onCancel) {
    const modal = document.getElementById('discardPrompt');
    const options = document.getElementById('discardOptions');
    const confirmBtn = document.getElementById('confirmDiscard');
  
    options.innerHTML = '';
    confirmBtn.disabled = true;
  
    const selectedIndices = new Set();
  
    playerHand.forEach((card, index) => {
      const btn = document.createElement('div');
      btn.classList.add('card-option');
      btn.textContent = card;
  
      btn.addEventListener('click', () => {
        if (selectedIndices.has(index)) {
          selectedIndices.delete(index);
          btn.classList.remove('selected');
        } else if (selectedIndices.size < payment) {
          selectedIndices.add(index);
          btn.classList.add('selected');
        }
  
        confirmBtn.disabled = selectedIndices.size !== payment;
      });
  
      options.appendChild(btn);
    });
  
    // Add cancel
    function cancelPrompt() {
      modal.classList.add('hidden');
      if (typeof onCancel === 'function') onCancel();
    }
  
    function cleanup() {
      confirmBtn.onclick = null;
      window.removeEventListener('keydown', escListener);
      modal.removeEventListener('click', outsideClick);
    }
  
    const escListener = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        cancelPrompt();
      }
    };
  
    const outsideClick = (e) => {
      if (e.target === modal) {
        cleanup();
        cancelPrompt();
      }
    };
  
    window.addEventListener('keydown', escListener);
    modal.addEventListener('click', outsideClick);
  
    confirmBtn.onclick = () => {
      const sorted = [...selectedIndices].sort((a, b) => b - a);
      for (let i of sorted) {
        playerHand.splice(i, 1);
      }
      renderHand();
      cleanup();
      modal.classList.add('hidden');
      if (typeof onSuccess === 'function') onSuccess();
    };
  
    modal.classList.remove('hidden');
  }
  

//make deck
  function generateDeck() {
    let deck = [];
    
    //  1-80
    for (let i = 1; i <= 80; i++) {
      deck.push(i);
    }
    
    // (2 'S' and 5 'F')

    deck.push('F', 'F', 'F', 'F', 'F');
  
    deck.push('S', 'S');

    return deck;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Draw a card
  drawCardBtn.addEventListener('click', function () {
    if (deck.length > 0 && playerHand.length<5) {
      const card = deck.pop();  
      playerHand.push(card);    
      textContent = card;
      renderHand();  
  
        // Display card value in the board
    } else {
      if(deck.length<1){
      alert('No more cards in the deck!');
    }
    if(playerHand.length>=5){
      alert("cannot draw more cards at this time")
    }
  }
  });
  //Discard a card
  discardBtn.addEventListener('click', function(){
    if (selectedCardIndex !== null)
    playerHand.splice(selectedCardIndex, 1); 
    selectedCardIndex = null;
    renderHand();
  }
  );

  createBoard();
  generateDeck();
  shuffle(deck);
  renderHand();



});
