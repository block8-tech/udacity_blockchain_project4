class Controller {
    constructor (params) {
        this.app = params.app;
        console.log('Controller.js connected');
        // Expose the home endpoint to the app.
        this.home();
    }

    home() {
        this.app.get('/', (req, res) => {
            res.send('Home connected').end();
        });
    }
}




module.exports = (params) => new Controller(params);