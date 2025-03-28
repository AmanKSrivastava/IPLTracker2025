document.addEventListener("DOMContentLoaded", function () {
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      updateLeaderboard(data);
      updateMatchHistory(data);
      addSortingFeature("leaderboard");
      addSortingFeature("matchHistory");
    })
    .catch((error) => console.error("Error loading data:", error));
});

function updateLeaderboard(data) {
  let leaderboardBody = document.querySelector("#leaderboard");
  leaderboardBody.innerHTML = "";

  let playerStats = {};

  // Collect player stats
  data.forEach((match) => {
    let maxPoints = Math.max(...Object.values(match.players));

    for (let player in match.players) {
      if (!playerStats[player]) {
        playerStats[player] = {
          totalPoints: 0,
          matchesPlayed: 0,
          winnings: 0,
          matchesWon: 0,
          lastMatchPoints: 0,
        };
      }

      playerStats[player].totalPoints += match.players[player];
      playerStats[player].matchesPlayed++;
      playerStats[player].lastMatchPoints = match.players[player];

      if (match.players[player] === maxPoints) {
        playerStats[player].matchesWon++;
        playerStats[player].winnings += match.winning_prize;
      }
    }
  });

  let playersArray = Object.keys(playerStats).map((player) => {
    let stats = playerStats[player];
    return {
      player,
      totalPoints: stats.totalPoints,
      matchesPlayed: stats.matchesPlayed,
      avgPoints: (stats.totalPoints / stats.matchesPlayed).toFixed(2),
      winnings: stats.winnings,
      entryFeePaid: stats.matchesPlayed * 50, // Assuming entry fee is ₹50 per match
      netProfitLoss: stats.winnings - stats.matchesPlayed * 50,
      matchesWon: stats.matchesWon,
      lastMatchPoints: stats.lastMatchPoints,
    };
  });

  // Sort by total points (highest first)
  playersArray.sort((a, b) => b.totalPoints - a.totalPoints);

  playersArray.forEach((player, index) => {
    let row = document.createElement("tr");

    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.player}</td>
            <td>${player.totalPoints}</td>
            <td>${player.matchesPlayed}</td>
            <td>${player.avgPoints}</td>
            <td>₹${player.winnings}</td>
            <td>₹${player.entryFeePaid}</td>
            <td style="color: ${
              player.netProfitLoss >= 0 ? "green" : "red"
            };">₹${player.netProfitLoss}</td>
            <td>${player.matchesWon}</td>
            <td>${player.lastMatchPoints}</td>
        `;

    leaderboardBody.appendChild(row);
  });
}

function updateMatchHistory(data) {
  let matchHistoryBody = document.querySelector("#matchHistory");
  matchHistoryBody.innerHTML = "";

  data.forEach((match) => {
    let maxPoints = Math.max(...Object.values(match.players));
    let winner = Object.keys(match.players).find(
      (player) => match.players[player] === maxPoints
    );

    let row = document.createElement("tr");
    row.innerHTML = `
            <td>${match.date}</td>
            <td>${match.match_no}</td>
            <td>${match.match_between}</td>
            <td>${winner}</td>
            <td>${match.players.Abhishek}</td>
            <td>${match.players.Aman}</td>
            <td>${match.players.Vikki}</td>
            <td>${match.players.Vasu}</td>
            <td>${match.players.Nabh}</td>
        `;

    matchHistoryBody.appendChild(row);
  });
}

// Sorting function
function addSortingFeature(tableId) {
  let table = document.querySelector(`#${tableId}`).closest("table");
  let headers = table.querySelectorAll("thead th");

  headers.forEach((header, colIndex) => {
    let ascending = true;
    let iconSpan = document.createElement("span");
    iconSpan.innerHTML = " ▲▼";
    iconSpan.style.marginLeft = "5px";
    header.appendChild(iconSpan);

    header.addEventListener("click", () => {
      let rows = Array.from(table.querySelector("tbody").rows);

      rows.sort((rowA, rowB) => {
        let cellA = rowA.cells[colIndex].textContent.trim();
        let cellB = rowB.cells[colIndex].textContent.trim();

        let numA = parseFloat(cellA.replace("₹", ""));
        let numB = parseFloat(cellB.replace("₹", ""));

        if (!isNaN(numA) && !isNaN(numB)) {
          return ascending ? numA - numB : numB - numA;
        } else {
          return ascending
            ? cellA.localeCompare(cellB)
            : cellB.localeCompare(cellA);
        }
      });

      ascending = !ascending;
      table.querySelector("tbody").append(...rows);

      headers.forEach((h) => (h.querySelector("span").innerHTML = " ▲▼"));
      iconSpan.innerHTML = ascending ? " ▲" : " ▼";
    });
  });
}
