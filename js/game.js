const HISTORY_LOCALSTORAGE_KEY = "mancalahistory";

class MancalaGame {
  constructor() {
    this.history = [
      {
        player: 1,
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

  applyMove(state, [row, col]) {
    const bigPockets = [...state.bigPockets];
    const smolPockets = state.smolPockets.map((r) => [...r]);
    const currentPlayer = row === 0 ? 1 : 2;
    const opponentPlayer = 3 - currentPlayer;
    const currentRow = currentPlayer - 1;
    const opponentRow = 1 - currentRow;
    let stones = smolPockets[row][col];
    if (stones === 0) {
      return state;
    }
    smolPockets[row][col] = 0;
    const ring = [
      [0, 5],
      [0, 4],
      [0, 3],
      [0, 2],
      [0, 1],
      [0, 0],
      ["big", 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      ["big", 1],
    ];
    const startIdx = ring.findIndex(([r, c]) => r === row && c === col);
    const rotatedRing = [
      ...ring.slice(startIdx + 1),
      ...ring.slice(0, startIdx + 1),
    ];
    let i = 0;
    while (stones > 0) {
      const [r, c] = rotatedRing[i % rotatedRing.length];
      if (r === "big" && c !== currentRow) {
        i++;
        continue;
      }
      if (r === "big") {
        bigPockets[c] = (bigPockets[c] || 0) + 1;
      } else {
        smolPockets[r][c]++;
      }
      stones--;
      i++;
    }
    const [lastR, lastC] = rotatedRing[(i - 1) % rotatedRing.length];
    if (
      lastR === currentRow &&
      smolPockets[lastR][lastC] === 1 &&
      smolPockets[opponentRow][lastC] > 0
    ) {
      const captured = smolPockets[opponentRow][lastC];
      smolPockets[opponentRow][lastC] = 0;
      smolPockets[lastR][lastC] = 0;
      bigPockets[currentRow] = (bigPockets[currentRow] || 0) + captured + 1;
    }
    const nextPlayer =
      lastR === "big" && lastC === currentRow ? currentPlayer : opponentPlayer;
    return {
      player: nextPlayer,
      bigPockets,
      smolPockets,
    };
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
