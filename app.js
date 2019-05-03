const {Blockchain} = require('./BlockChain');

class APP {
    constructor (config) {
        console.log('\nSetting up APP()');
        // Init application state object.
        this.state = { ...config };
        // Create the app.
        this.app = require('express')();
        // Add this.app to the config object.
        this.state.app = this.app;
        // Setup middleware.
        this.initMiddleware();
        // Setup the Mempool.
        this.mempool = require('./Mempool')(this.state);
        // Add this.mempool to the config object.
        this.state.mempool = this.mempool;
        // Setup the database.
        this.db = new Blockchain();
        this.state.db = this.db;
        // Setup the controller(s) and pass the config object.
        this.initControllers(this.state);
        // Start the application adn pass the config object.
        this.start(this.state);
        // Console log a string stating that the application was successfully started.
        this.app.on('app started', () => console.log('\n*---> The application was successfully started <---*\n'));
    }

    initMiddleware() {
        const bodyparser = require('body-parser');
        this.app.use(bodyparser.json());
        this.app.use(bodyparser.urlencoded({extended:true}));
    }

    initControllers(config) {
        require('./Controllers/controller.js')(config);
        // require('./Controllers/BlockController')(config);
    }

    start(config) {
        this.app.listen(config.port, () => {
            console.log(`Server started... http://localhost:${config.port}`);
            this.app.emit('app started')
        });
    }

}

/**
 * START the APP
 */
const config = {
    port: process.env.PORT || 8000,
    printOut: false
};
new APP(config);