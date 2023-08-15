import http from 'http';
import App from './app/server';
import TgBot from './bot/bot';
import { dbConnection } from './app/database';

const Bot = new TgBot();

const ExpressApp = new App();

const server = http.createServer(ExpressApp.getServer);

dbConnection();
Bot.runBot();
// _________LISTEN PORT___________
const port = process.env.PORT || 5000;

server.listen(port, () => console.log('Listening port on ' + port));
