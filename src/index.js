const Express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares");
const middlewares = require("./middlewares");
const mongoose = require("mongoose");
const twisted = require("twisted");
const { LolApi, Constants } = require("twisted");
require("dotenv").config();

const api = new LolApi();

// Champion List Function
async function getChampionList() {
  // Attempt to get champion data
  try {
    // First grab entire champion list (getChampion() without an argument will return a list of all champions, but with limited data).
    let data = await api.DataDragon.getChampion();

    // Now let's parse this data to create a "parsedChampion" object which will just contain what we need to insert into the DB
    data = JSON.parse(JSON.stringify(data))["data"];
    for (var key in data) {
      // Set the current champion to a variable
      let currentChampion = data[key];
      
      // Create an empty object which we'll use to store the data we actually need.
      let parsedChampion = {};

      // As we loop through each attribute, only add the ones we need (the ones listed here in this array)
      for (var attribute in currentChampion) {
        if (
          [
            "skins",
            "version",
            "id",
            "key",
            "name",
            "title",
            "blurb",
            "image",
          ].includes(attribute)
        ) {
          // If it's an attribute we want, add it to parsedChampion
          parsedChampion[attribute] = currentChampion[attribute];
        }
      }

      // Because the full champion list does not return champion skins, we need to make a another individual champion call.
      // This is done by using the same getChampion function, but passing in the champion's name.
      let championSkins = await api.DataDragon.getChampion(
        currentChampion["name"]
      );
      // We only want the "skins" array.
      championSkins = JSON.parse(JSON.stringify(championSkins))["skins"];

      // Add skin count now that we have it (just the length of the skins array)
      parsedChampion["skinCount"] = championSkins.length;

      // Lastly, we also need the champion image; let's just grab the version and full image from what we have already and set
      // "image" to just be the URL so we don't need to do anything later.
      parsedChampion[
        "image"
      ] = `http://ddragon.leagueoflegends.com/cdn/${parsedChampion["version"]}/img/champion/${parsedChampion["image"]["full"]}`;

      // This is where we'll insert the parsedChampion object into the DB
      console.log(parsedChampion);

        /* Example of parsed champion to be inserted into DB
            {
                version: '10.16.1',
                id: 'AurelionSol',
                key: '136',
                name: 'Aurelion Sol',
                title: 'The Star Forger',
                blurb: 'Aurelion Sol once graced the vast emptiness of the cosmos with celestial wonders of his own devising. Now, he is forced to wield his awesome power at the behest of a space-faring empire that tricked him into servitude. Desiring a return to his...',
                image: 'http://ddragon.leagueoflegends.com/cdn/10.16.1/img/champion/AurelionSol.png',
                skinCount: 3
            }
        */

      // This makes the program "sleep" for 3 seconds; we need this because Riot has a strict API rate limit.
      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (error) {
    console.error(error);
  }
}

getChampionList();

// Connection to MongoDB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true });

// Create new express application
const app = Express();

// Logger and Cors middleware for request logging/permission
app.use(morgan("common"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

//Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Error middlewares
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Connection to port with a callback function logging `Listening at http://localhost:${port}` in the terminal
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
