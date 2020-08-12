const { LolApi } = require("twisted");
const { Champion } = require("../models/data.js");

/**
 * Helper function to parse Riot API response
 *
 * @param {object} data An JSON object returned by Riot's API
 * @param {string} key Return specific key from data JSON obkect.
 *
 * @return {Object} Returns JS object we can easily parse.
 */
function parseResponse(data, key) {
  return JSON.parse(JSON.stringify(data))[key];
}

/**
 * Upsert into DB; this means check if a record with the key exists first and update that record if so; otherwise create a new record
 *
 * @param {object} parsedChampion A JSON object containing parsed chapmion data (data we actually need)
 * @param {int} currentChampionCount An integer representing the current "number" champion being upserted.
 * @param {int} totalChampions An integer representing the total number of champions.
 *
 * @return {response} Returns response based on outcome of upsert attempt.
 */
function upsertParsedChampion(
  parsedChampion,
  currentChampionCount,
  totalChampions
) {
  var query = { key: parsedChampion["key"] };
  Champion.findOneAndUpdate(query, parsedChampion, { upsert: true }, function (
    err,
    doc
  ) {
    if (err) console.log(err);
    console.log(
      "Succesfully saved (" + currentChampionCount + "/" + totalChampions + ")."
    );
  });
}

/**
 * Grabs and parses champion data from Riot's API so we can store information needed to play guessing game.
 */
async function importChampionData() {
  try {
    const api = new LolApi();

    let championListData = parseResponse(
      await api.DataDragon.getChampion(),
      "data"
    );

    let currentChampionCount = 1;
    let totalChampions = Object.keys(championListData).length;

    for (var championKey in championListData) {
      let currentChampion = championListData[championKey];
      let parsedChampion = {};
      let attributes = {
        skins: true,
        version: true,
        id: true,
        key: true,
        name: true,
        title: true,
        blurb: true,
        image: true,
      };

      let championSkins = parseResponse(
        await api.DataDragon.getChampion(currentChampion["name"]),
        "skins"
      );

      for (var attribute in currentChampion) {
        if (attribute in attributes) {
          parsedChampion[attribute] = currentChampion[attribute];
        }
      }
      parsedChampion["skinCount"] = championSkins.length;
      parsedChampion[
        "image"
      ] = `http://ddragon.leagueoflegends.com/cdn/${parsedChampion["version"]}/img/champion/${parsedChampion["image"]["full"]}`;

      upsertParsedChampion(
        parsedChampion,
        currentChampionCount,
        totalChampions
      );

      currentChampionCount++;

      // Sleep for 8 seconds to avoid hitting rate limit
      await new Promise((r) => setTimeout(r, 20000));
    }
  } catch (error) {
    console.error(error);
  }
}

importChampionData();
