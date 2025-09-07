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
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const scores = parseCSV(text);
    buildLeaderboard(scores);

    // Update last updated timestamp
    const now = new Date();
    document.getElementById("last-updated").textContent =
      "Last updated: " + now.toLocaleString();
  } catch (err) {
    console.error("Error loading scores:", err);
  }
}

// Convert CSV to { team: { points, wins, losses, ties } } object
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const scores = {};
  lines.slice(1).forEach(line => { // skip header
    const [team, points, wins, losses, ties] = line.split(",");
    if (!team || !team.trim()) return; // skip empty lines
    scores[team.trim()] = {
      points: parseFloat(points) || 0,
      wins: parseInt(wins) || 0,
      losses: parseInt(losses) || 0,
      ties: parseInt(ties) || 0
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
    let totalTies = 0;

    const teamScores = teams.map(team => {
      const t = scores[team] || { points: 0, wins: 0, losses: 0, ties: 0 };
      total += t.points + 0.5 * t.ties;
      totalWins += t.wins;
      totalLosses += t.losses;
      totalTies += t.ties;
      return {
        name: team,
        points: t.points + 0.5 * t.ties,
        wins: t.wins,
        losses: t.losses,
        ties: t.ties
      };
    });

    leaderboard.push({
      player,
      total,
      totalWins,
      totalLosses,
      totalTies,
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

    // Show player total points and combined record (Wins-Losses-Ties)
    const header = document.createElement("div");
    header.className = "player-header";
    header.innerHTML = `<span>#${index + 1} ${entry.player}</span>
                        <span>${entry.total.toFixed(1)} pts • Total Record: ${entry.totalWins}-${entry.totalLosses}-${entry.totalTies}</span>`;
    card.appendChild(header);

    // List each team with points and record
    const list = document.createElement("ul");
    list.className = "team-list";
    entry.teamScores.forEach(t => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="team-name">${t.name}</span>
                      <span class="team-record">(${t.wins}-${t.losses}${t.ties > 0 ? '-' + t.ties : ''})</span>
                      <span class="team-points">${t.points.toFixed(1)}</span>`;
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
