new MinnieMax({
  el: document.querySelector(".minniemax"),
  localStorageKey: "mancalahelper",
  initialMovesAhead: 7,
  initialState: {
    bigPockets: [0, 0],
    smolPockets: [
      [4, 4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4, 4],
    ],
  },
  getMoves: ({ state, player }) => {
    const moves = [];
    const smolPocketIndex = player === 1 ? 1 : 0;
    state.smolPockets[smolPocketIndex].forEach((value, index) => {
      if (value > 0) {
        moves.push([smolPocketIndex, index]);
      }
    });
    return moves;
  },
  getNextState: ({ state, player, move }) => {
    const bigPockets = [...state.bigPockets];
    const smolPockets = state.smolPockets.map((r) => [...r]);
    const opponentPlayer = 3 - player;
    const currentRow = player === 1 ? 1 : 0;
    const opponentRow = 1 - currentRow;
    const [row, col] = move;
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
      lastR === "big" && lastC === currentRow ? player : opponentPlayer;
    return {
      state: { bigPockets, smolPockets },
      player: nextPlayer,
    };
  },
  getStateScore: ({ state, player }) =>
    state.bigPockets[player === 1 ? 1 : 0] - state.bigPockets[player - 1],
  isGameOver: ({ state }) =>
    state.smolPockets.every((row) => row.every((cell) => cell === 0)),
  onChange: ({ minnie }) => {
    const { state, player } = minnie.getState();
    const bigPockets = document.querySelectorAll(".big-pocket");
    state.bigPockets.forEach((value, index) => {
      bigPockets[index].innerHTML = value;
    });
    const rows = document.querySelectorAll(".row");
    state.smolPockets.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        rows[rowIndex].children[cellIndex].innerHTML = cell;
      });
    });
    document
      .querySelectorAll(".suggested")
      .forEach((el) => el.classList.remove("suggested"));
    minnie.getScoredMoves(state, player).then((scoredMoves) => {
      const [ri, ci] = scoredMoves[0].move;
      rows[ri].children[ci].classList.add("suggested");
    });
  },
  onReady: ({ minnie }) => {
    document.querySelectorAll(".row").forEach((row, ri) => {
      Array.from(row.children).forEach((cell, ci) => {
        cell.addEventListener("click", () => {
          const { state, player } = minnie.getState();
          if (cell.innerText === "0" || minnie.isGameOver({ state })) {
            return;
          }
          const { state: nextState, player: nextPlayer } = minnie.getNextState({
            minnie,
            state,
            player,
            move: [ri, ci],
          });
          minnie.pushState(nextState, nextPlayer);
          minnie.onChange({ minnie });
        });
      });
    });
    minnie.onChange({ minnie });
  },
});
