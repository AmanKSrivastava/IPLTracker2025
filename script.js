let currentPage = 1;
const rowsPerPage = 5;
let matchData = [];
let sortOrder = {
  leaderboard: { key: "", order: "asc" },
  matchHistory: { key: "", order: "asc" },
};

// Fetch data from JSON
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    matchData = data;
    updateLeaderboard(data);
    updateMatchHistory();
    attachSortingListeners();
  })
  .catch((error) => console.error("Error loading data:", error));

// Update Leaderboard Table
function updateLeaderboard(data) {
  const leaderboardTable = document.getElementById("leaderboard-body");
  leaderboardTable.innerHTML = "";
  const players = {};

  data.forEach((match) => {
    Object.keys(match.players).forEach((player) => {
      if (!players[player]) {
        players[player] = {
          name: player,
          totalPoints: 0,
          matchesPlayed: 0,
          totalWinnings: 0,
          entryFeePaid: 0,
          matchesWon: 0,
          maxPointsEver: 0,
        };
      }
      if (match.players[player] !== undefined && match.players[player] !== 0) {
        players[player].totalPoints += match.players[player];
        players[player].matchesPlayed += 1;
        players[player].entryFeePaid += match.entry_fee;
        players[player].maxPointsEver = Math.max(
          players[player].maxPointsEver,
          match.players[player]
        );
      }
      if (
        match.winning_prize > 0 &&
        match.players[player] === Math.max(...Object.values(match.players))
      ) {
        players[player].totalWinnings += match.winning_prize;
        players[player].matchesWon += 1;
      }
    });
  });

  let sortedPlayers = Object.values(players);
  if (sortOrder.leaderboard.key) {
    sortedPlayers.sort((a, b) =>
      sortOrder.leaderboard.order === "asc"
        ? a[sortOrder.leaderboard.key] - b[sortOrder.leaderboard.key]
        : b[sortOrder.leaderboard.key] - a[sortOrder.leaderboard.key]
    );
  } else {
    sortedPlayers.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  sortedPlayers.forEach((player, index) => {
    const netProfit = player.totalWinnings - player.entryFeePaid;
    leaderboardTable.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.totalPoints}</td>
        <td>${player.matchesPlayed}</td>
        <td>${
          player.matchesPlayed > 0
            ? (player.totalPoints / player.matchesPlayed).toFixed(2)
            : "N/A"
        }</td>
        <td>₹${player.totalWinnings}</td>
        <td>₹${player.entryFeePaid}</td>
        <td style="color: ${
          netProfit > 0 ? "green" : netProfit < 0 ? "red" : "black"
        };">₹${netProfit}</td>
        <td>${player.matchesWon}</td>
        <td>${player.maxPointsEver}</td>
      </tr>`;
  });
}

// Update Match History Table
function updateMatchHistory() {
  const matchHistoryTable = document.getElementById("match-history-body");
  matchHistoryTable.innerHTML = "";
  let paginatedMatches = matchData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  if (sortOrder.matchHistory.key) {
    paginatedMatches.sort((a, b) =>
      typeof a[sortOrder.matchHistory.key] === "string"
        ? sortOrder.matchHistory.order === "asc"
          ? a[sortOrder.matchHistory.key].localeCompare(
              b[sortOrder.matchHistory.key]
            )
          : b[sortOrder.matchHistory.key].localeCompare(
              a[sortOrder.matchHistory.key]
            )
        : sortOrder.matchHistory.order === "asc"
        ? a[sortOrder.matchHistory.key] - b[sortOrder.matchHistory.key]
        : b[sortOrder.matchHistory.key] - a[sortOrder.matchHistory.key]
    );
  }
  paginatedMatches.forEach((match) => {
    matchHistoryTable.innerHTML += `
      <tr>
        <td>${match.date}</td>
        <td>${match.match_no}</td>
        <td>${match.match_between}</td>
        <td>${getMatchWinner(match.players)}</td>
        <td>${match.players["Abhishek"] || 0}</td>
        <td>${match.players["Aman"] || 0}</td>
        <td>${match.players["Vikki"] || 0}</td>
        <td>${match.players["Vasu"] || 0}</td>
        <td>${match.players["Nabh"] || 0}</td>
      </tr>`;
  });
  updatePagination();
}

// Sorting Functionality
function attachSortingListeners() {
  document.querySelectorAll("th").forEach((header) => {
    header.addEventListener("click", () => {
      const tableId = header.closest("table").id;
      const key = header.getAttribute("data-key");
      if (key) {
        sortOrder[tableId].order =
          sortOrder[tableId].key === key && sortOrder[tableId].order === "asc"
            ? "desc"
            : "asc";
        sortOrder[tableId].key = key;
        if (tableId === "leaderboard") {
          updateLeaderboard(matchData);
        } else {
          updateMatchHistory();
        }
      }
    });
  });
}

// Pagination Controls
function nextPage() {
  if (currentPage < Math.ceil(matchData.length / rowsPerPage)) {
    currentPage++;
    updateMatchHistory();
  }
}
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    updateMatchHistory();
  }
}
function updatePagination() {
  const totalPages = Math.ceil(matchData.length / rowsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  if (currentPage > 1)
    pagination.innerHTML += `<button onclick="prevPage()">Previous</button>`;
  if (currentPage < totalPages)
    pagination.innerHTML += `<button onclick="nextPage()">Next</button>`;
}

function getMatchWinner(players) {
  return (
    Object.entries(players).reduce(
      (max, [player, points]) => (points > max[1] ? [player, points] : max),
      ["", 0]
    )[0] || "No Winner"
  );
}
