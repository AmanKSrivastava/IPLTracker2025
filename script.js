let currentPage = 1;
const rowsPerPage = 5;
let matchData = [];
let sortOrder = {}; // Store the current sorting order

// Fetch data from the JSON file
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    matchData = data;
    updateLeaderboard(data);
    updateMatchHistory();
    attachSortingListeners(); // Ensure sorting event listeners are attached
  })
  .catch((error) => console.error("Error loading data:", error));

// Update the leaderboard table
function updateLeaderboard(data) {
  const leaderboardTable = document.getElementById("leaderboard-body");
  leaderboardTable.innerHTML = ""; // Clear the table

  const players = {};

  // Collect player data from the matches
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

        if (match.players[player] > players[player].maxPointsEver) {
          players[player].maxPointsEver = match.players[player];
        }
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

  // Apply sorting if a column is selected
  if (sortOrder.leaderboard) {
    sortedPlayers.sort((a, b) => {
      const key = sortOrder.leaderboard.key;
      return sortOrder.leaderboard.order === "asc"
        ? a[key] - b[key]
        : b[key] - a[key];
    });
  } else {
    sortedPlayers.sort((a, b) => b.totalPoints - a.totalPoints); // Default sorting
  }

  // Populate the leaderboard table
  sortedPlayers.forEach((player, index) => {
    const row = document.createElement("tr");
    const avgPoints =
      player.matchesPlayed > 0
        ? (player.totalPoints / player.matchesPlayed).toFixed(2)
        : "N/A";
    const netProfit = player.totalWinnings - player.entryFeePaid;

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.totalPoints}</td>
      <td>${player.matchesPlayed}</td>
      <td>${avgPoints}</td>
      <td>₹${player.totalWinnings}</td>
      <td>₹${player.entryFeePaid}</td>
      <td style="color: ${
        netProfit > 0 ? "green" : netProfit < 0 ? "red" : "black"
      };">₹${netProfit}</td>
      <td>${player.matchesWon}</td>
      <td>${player.maxPointsEver}</td>
    `;

    leaderboardTable.appendChild(row);
  });
}

// Update the match history table
function updateMatchHistory() {
  const matchHistoryTable = document.getElementById("match-history-body");
  matchHistoryTable.innerHTML = "";

  let paginatedMatches = matchData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (sortOrder.matchHistory) {
    paginatedMatches.sort((a, b) => {
      const key = sortOrder.matchHistory.key;
      if (typeof a[key] === "string") {
        return sortOrder.matchHistory.order === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      } else {
        return sortOrder.matchHistory.order === "asc"
          ? a[key] - b[key]
          : b[key] - a[key];
      }
    });
  }

  // Populate the match history table
  paginatedMatches.forEach((match) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${match.date}</td>
      <td>${match.match_no}</td>
      <td>${match.match_between}</td>
      <td>${getMatchWinner(match.players)}</td>
      <td>${match.players["Abhishek"] || 0}</td>
      <td>${match.players["Aman"] || 0}</td>
      <td>${match.players["Vikki"] || 0}</td>
      <td>${match.players["Vasu"] || 0}</td>
      <td>${match.players["Nabh"] || 0}</td>
    `;

    matchHistoryTable.appendChild(row);
  });
}

function getMatchWinner(players) {
  const maxPointsPlayer = Object.entries(players).reduce(
    (max, [player, points]) => (points > max[1] ? [player, points] : max),
    ["", 0]
  );
  return maxPointsPlayer[0] || "No Winner";
}

// Attach sorting functionality to table headers
function attachSortingListeners() {
  const headers = document.querySelectorAll("th");

  headers.forEach((header) => {
    header.addEventListener("click", () => {
      const tableId = header.closest("table").id;
      const key = header.getAttribute("data-key");

      if (!sortOrder[tableId]) {
        sortOrder[tableId] = {};
      }

      const order =
        sortOrder[tableId].key === key && sortOrder[tableId].order === "asc"
          ? "desc"
          : "asc";
      sortOrder[tableId] = { key, order };

      if (tableId === "leaderboard") {
        updateLeaderboard(matchData);
      } else if (tableId === "matchHistory") {
        updateMatchHistory();
      }
    });
  });
}

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
