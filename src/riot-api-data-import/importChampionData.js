const { LolApi, Constants } = require("twisted");
require("dotenv").config();

const api = new LolApi();

function parseResponse(data, key) {
  return JSON.parse(JSON.stringify(data))[key];
}

async function importChampionData() {
  try {
    let championListData = parseResponse(
      await api.DataDragon.getChampion(),
      "data"
    );

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

      // Insert parsedChampion into DB here
      console.log(parsedChampion);

      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (error) {
    console.error(error);
  }
}

importChampionData();
