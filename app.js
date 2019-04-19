class APP {
    constructor (config) {
        console.log('Setting up APP()');
        // Create the app.
        this.app = require('express')();
        // Add this.app to the params.
        config.app = this.app;
        // Setup middleware.
        this.initMiddleware();
        // Setup the Mempool.
        this.mempool = require('./Mempool');
        // Setup the controller(s).
        this.initControllers(config);
        // Start the application.
        this.start(config);
    }

    initMiddleware() {
        const bodyparser = require('body-parser');
        this.app.use(bodyparser.json());
        this.app.use(bodyparser.urlencoded({extended:true}));
    }

    initControllers(config) {
        require('./Controllers/controller.js')(config);
    }

    start(config) {
        this.app.listen(config.port, () => {
            console.log(`Server Listening for port: ${config.port}`);
        });
    }
}

/**
 * START the APP
 */
const config = {
    port: process.env.PORT || 8000
};
new APP(config);