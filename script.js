// Fetch data from data.json and update the tables
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    updateLeaderboard(data);
    updateMatchHistory(data);
  })
  .catch((error) => console.error("Error loading data:", error));

function updateLeaderboard(data) {
  const leaderboardTable = document.getElementById("leaderboard");
  leaderboardTable.innerHTML = ""; // Clear table before adding rows

  const players = {}; // Object to store player stats

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
          lastMatchPoints: "N/A",
        };
      }

      // If player participated in the match (points > 0)
      if (match.players[player] !== undefined && match.players[player] !== 0) {
        players[player].totalPoints += match.players[player];
        players[player].matchesPlayed += 1;
        players[player].lastMatchPoints = match.players[player];

        // Only add entry fee if player participated
        players[player].entryFeePaid += match.entry_fee;
      }

      // If player won, add winnings
      if (
        match.winning_prize > 0 &&
        match.players[player] === Math.max(...Object.values(match.players))
      ) {
        players[player].totalWinnings += match.winning_prize;
        players[player].matchesWon += 1;
      }
    });
  });

  // Convert players object to array and sort by total points
  const sortedPlayers = Object.values(players).sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

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
      };">
        ₹${netProfit}
      </td>
      <td>${player.matchesWon}</td>
      <td>${player.lastMatchPoints}</td>
    `;

    leaderboardTable.appendChild(row);
  });
}

function updateMatchHistory(data) {
  const matchHistoryTable = document.getElementById("matchHistory");
  matchHistoryTable.innerHTML = ""; // Clear table before adding rows

  data.forEach((match) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${match.date}</td>
      <td>${match.match_no}</td>
      <td>${match.match_between}</td>
      <td>${getMatchWinner(match.players)}</td>
      <td>${
        match.players.Abhishek !== undefined ? match.players.Abhishek : "N/A"
      }</td>
      <td>${match.players.Aman !== undefined ? match.players.Aman : "N/A"}</td>
      <td>${
        match.players.Vikki !== undefined ? match.players.Vikki : "N/A"
      }</td>
      <td>${match.players.Vasu !== undefined ? match.players.Vasu : "N/A"}</td>
      <td>${match.players.Nabh !== undefined ? match.players.Nabh : "N/A"}</td>
    `;

    matchHistoryTable.appendChild(row);
  });
}

// Function to get match winner based on highest points
function getMatchWinner(players) {
  const maxPoints = Math.max(...Object.values(players));
  const winners = Object.keys(players).filter(
    (player) => players[player] === maxPoints
  );
  return winners.join(", ") || "N/A";
}
