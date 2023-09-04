const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: "./moviesData.db",
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

initializeDBAndServer();

app.get("/movies", async (req, res) => {
  try {
    const getMovies = `select movie_name from movie`;
    const moviesResponse = await db.all(getMovies);
    res.send(
      moviesResponse.map((list) => {
        return {
          movieName: list.movie_name,
        };
      })
    );
  } catch (error) {
    console.log(error);
  }
});

// {
//   "directorId": 6,
//   "movieName": "Jurassic Park",
//   "leadActor": "Jeff Goldblum"
// }
app.post("/movies", async (req, res) => {
  try {
    const { directorId, movieName, leadActor } = req.body;
    const postSingleMovie = `insert into movie(director_id, movie_name, lead_actor) values(${directorId}, '${movieName}', '${leadActor}');`;
    await db.run(postSingleMovie);
    res.send("Movie Successfully Added");
  } catch (error) {
    console.log(error);
  }
});

app.get("/movies/:movieId/", async (req, res) => {
  try {
    const { movieId } = req.params;
    const getSingleMovie = `select * from movie where movie_id = ${movieId}`;
    const response = await db.get(getSingleMovie);
    if (!response) {
      res.send(
        `no movie with id ${movieId} try searching from 46 to 117 range`
      );
    }
    res.send({
      movieId: response.movie_id,
      directorId: response.director_id,
      movieName: response.movie_name,
      leadActor: response.lead_actor,
    });
  } catch (error) {
    console.log(error);
  }
});

app.put("/movies/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;
    const { directorId, movieName, leadActor } = req.body;
    const updateMovie = `update movie set director_id=${directorId}, movie_name='${movieName}', lead_actor='${leadActor}' where movie_id=${movieId};`;
    await db.run(updateMovie);
    res.send("Movie Details Updated");
  } catch (error) {
    console.log(error);
  }
});

app.delete("/movies/:movieId/", async (req, res) => {
  try {
    const { movieId } = req.params;
    const deleteMovie = `delete from movie where movie_id=${movieId}`;
    await db.run(deleteMovie);
    res.send("Movie Removed");
  } catch (error) {
    console.log(error);
  }
});

app.get("/directors", async (req, res) => {
  try {
    const getDirector = `select * from director`;
    const response = await db.all(getDirector);
    res.send(
      response.map((list) => {
        return {
          directorId: list.director_id,
          directorName: list.director_name,
        };
      })
    );
  } catch (error) {
    console.log(error);
  }
});

app.get("/directors/:directorId/movies", async (req, res) => {
  try {
    const { directorId } = req.params;
    const getMovies = `select movie_name from movie where director_id =${directorId}`;
    const response = await db.all(getMovies);
    res.send(
      response.map((list) => {
        return {
          movieName: list.movie_name,
        };
      })
    );
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
