// Players and their drafted teams
const players = {
  "Rachel": ["Eagles", "Texans", "Buccaneers", "Bears", "Seahawks"],
  "Dad": ["Ravens", "Packers", "Broncos", "Patriots", "Jets"],
  "Gma": ["Chiefs", "Steelers", "Vikings", "Raiders", "Falcons"],
  "Frank": ["Bills", "Chargers", "Colts", "Browns", "Giants"],
  "Zach": ["Lions", "Rams", "49ers", "Cowboys", "Cardinals"],
  "Will": ["Bengals", "Commanders", "Dolphins", "Jaguars", "Titans"]
};

// Replace with your published Google Sheet CSV link
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQL8zOR1rwqjIyqPnuUe2swJ6_GokdRSuboJzSFVzvWC-JKnvtIIpNHMD6ccZrcGs7DTohpm31BOE0n/pub?output=csv";

// Load scores from Google Sheets CSV
async function loadScores() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const scores = parseCSV(text);
  buildLeaderboard(scores);

  // Update last updated timestamp
  const now = new Date();
  document.getElementById("last-updated").textContent =
    "Last updated: " + now.toLocaleString();
}

// Convert CSV to { team: { points, wins, losses } } object
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const scores = {};
  lines.slice(1).forEach(line => { // skip header
    const [team, points, wins, losses] = line.split(",");
    scores[team.trim()] = {
      points: parseFloat(points) || 0,
      wins: parseInt(wins) || 0,
      losses: parseInt(losses) || 0
    };
  });
  return scores;
}

// Build leaderboard
function buildLeaderboard(scores) {
  const leaderboard = [];

  for (const [player, teams] of Object.entries(players)) {
    let total = 0;
    let totalWins = 0;
    let totalLosses = 0;

    const teamScores = teams.map(team => {
      const t = scores[team] || { points: 0, wins: 0, losses: 0 };
      total += t.points;
      totalWins += t.wins;
      totalLosses += t.losses;
      return {
        name: team,
        points: t.points,
        wins: t.wins,
        losses: t.losses
      };
    });

    leaderboard.push({
      player,
      total,
      totalWins,
      totalLosses,
      teamScores
    });
  }

  // Sort by total points, descending
  leaderboard.sort((a, b) => b.total - a.total);

  const container = document.getElementById("players");
  container.innerHTML = "";

  leaderboard.forEach((entry, index) => {
    const card = document.createElement("div");
    card.className = "player-card";

    // Highlight top player
    if(index === 0) {
      card.classList.add("top-player");
    }

    // Show player total points and combined record
    const header = document.createElement("div");
    header.className = "player-header";
    header.innerHTML = `<span>#${index + 1} ${entry.player}</span><span>${entry.total} pts • Total Record: ${entry.totalWins}-${entry.totalLosses}</span>`;
    card.appendChild(header);

    // List each team with points and record
    const list = document.createElement("ul");
    list.className = "team-list";
    entry.teamScores.forEach(t => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${t.name} (${t.wins}-${t.losses})</span><span>${t.points}</span>`;
      list.appendChild(li);
    });

    card.appendChild(list);
    container.appendChild(card);
  });
}

// Run on load
loadScores();

// Auto-refresh every 5 minutes
setInterval(() => {
  loadScores();
}, 300000);
