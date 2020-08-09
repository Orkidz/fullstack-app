const Express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares');
const middlewares = require('./middlewares');
const mongoose = require('mongoose')
const twisted = require('twisted');
const { LolApi, Constants } = require('twisted');
require('dotenv').config();

const api = new LolApi();

// Champion List Function
async function getChampionList() {
    try {
       let data = await api.DataDragon.getChampion();
       data = JSON.parse(JSON.stringify(data))["data"];
       for (var key in data) {
           let currentChampion = data[key];
           let parsedChampion = {}
           for (var attribute in currentChampion) {
               if (["skins", "version", "id", "key", "name", "title", "blurb", "image"].includes(attribute)) {
                parsedChampion[attribute] = currentChampion[attribute];
               }

           }
            let championSkins = await api.DataDragon.getChampion(currentChampion["name"]);
            championSkins = JSON.parse(JSON.stringify(championSkins))["skins"];
            parsedChampion["skinCount"] = championSkins.length;
            console.log(parsedChampion);
            await new Promise(r => setTimeout(r, 3000));
       }
    } catch (error) {
        console.error(error)
    } 
};

getChampionList();

// Connection to MongoDB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true });


// Create new express application
const app = Express();

// Logger and Cors middleware for request logging/permission
app.use(morgan('common'));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));

//Route
app.get('/', (req, res) => {
    res.send('Hello World')
});

// Error middlewares
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Connection to port with a callback function logging `Listening at http://localhost:${port}` in the terminal
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});

