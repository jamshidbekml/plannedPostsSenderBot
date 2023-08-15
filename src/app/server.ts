import cors from 'cors';
import express, { Express, Router } from 'express';
import path from 'path';

class App {
    public app: Express;

    constructor() {
        this.app = express();

        this.initializeMiddlewares();
    }

    public get getServer() {
        return this.app;
    }

    private initializeMiddlewares() {}
}

export default App;
