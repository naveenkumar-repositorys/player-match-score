let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");

let app = express();
let dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

app.use(express.json());

const listOfPlayerMatches = [];

let convertDbObjectToResponseObject = (dbResponse) => {
  return {
    playerId: dbResponse.player_id,
    playerName: dbResponse.player_name,
  };
};

let initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API-1

app.get("/players/", async (request, response) => {
  let getAllPlayersQuery = `SELECT * FROM player_details;`;
  let dbResponse = await db.all(getAllPlayersQuery);
  /*console.log(
    dbResponse.map((eachItem) => convertDbObjectToResponseObject(eachItem))
  );*/
  response.send(
    dbResponse.map((eachItem) => convertDbObjectToResponseObject(eachItem))
  );
});

//API-2

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getAllPlayersQuery = `SELECT player_id AS playerId,player_name AS playerName
   FROM player_details
   WHERE player_id = ${playerId};`;
  let dbResponse = await db.get(getAllPlayersQuery);
  //console.log(dbResponse);
  response.send(dbResponse);
});

//API-3

app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let { playerName } = request.body;
  let updatePlayersQuery = `UPDATE player_details
   SET  player_name = "${playerName}"
   WHERE player_id = ${playerId};`;
  let dbResponse = await db.run(updatePlayersQuery);
  //console.log(dbResponse);
  response.send("Player Details Updated");
});

//API-4

app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  let getAllMatchDetailsQuery = `SELECT match_id AS matchId ,match,year
   FROM match_details
   WHERE match_id = ${matchId};`;
  let dbResponse = await db.get(getAllMatchDetailsQuery);
  //console.log(dbResponse);
  response.send(dbResponse);
});

//API-5

app.get("/players/:playerId/matches/", async (request, response) => {
  let { playerId } = request.params;
  let matchesOfPlayerQuery = `SELECT match_id AS matchId,match,year
  FROM 
    match_details NATURAL JOIN player_match_score
  WHERE 
    player_id = ${playerId};`;
  let dbResponse = await db.get(matchesOfPlayerQuery);
  listOfPlayerMatches.push(dbResponse);
  //console.log(listOfPlayerMatches);
  response.send(listOfPlayerMatches);
});
