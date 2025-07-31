const HISTORY_LOCALSTORAGE_KEY = "mancalahistory";

class MancalaGame {
  constructor() {
    this.history = [
      {
        bigPockets: [0, 0],
        smolPockets: [
          [4, 4, 4, 4, 4, 4],
          [4, 4, 4, 4, 4, 4],
        ],
      },
    ];
    const storedHistory = localStorage?.getItem(HISTORY_LOCALSTORAGE_KEY);
    if (storedHistory) {
      let storedHistoryParsed;
      try {
        storedHistoryParsed = JSON.parse(storedHistory);
      } catch (e) {
        console.warn("Could not parse stored history.");
      }
      if (storedHistoryParsed) {
        this.history = storedHistoryParsed;
      } else {
        console.log("Starting a new game.");
      }
    } else {
      console.log("No stored history. Starting a new game.");
    }
  }

  applyMove(state, move) {
    // TODO
    return state;
  }

  evaluate(state, player) {
    return state.bigPockets[player - 1];
  }

  generateMoves(state, player) {
    const moves = [];
    state.smolPockets[player - 1].forEach((value, index) => {
      if (value > 0) {
        moves.push([player - 1, index]);
      }
    });
    return moves;
  }

  getState() {
    return this.history[this.history.length - 1];
  }

  isGameOver(state) {
    return state.smolPockets.every((row) => row.every((cell) => cell === 0));
  }

  pushState(state) {
    this.history.push(state);
    if (localStorage) {
      localStorage.setItem(
        HISTORY_LOCALSTORAGE_KEY,
        JSON.stringify(this.history)
      );
    }
  }

  undoMove() {
    if (this.history.length < 2) {
      return;
    }
    this.history.pop();
    if (localStorage) {
      localStorage.setItem(
        HISTORY_LOCALSTORAGE_KEY,
        JSON.stringify(this.history)
      );
    }
  }
}
