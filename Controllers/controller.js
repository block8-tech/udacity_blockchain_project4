class Controller {
    constructor (params) {
        this.app = params.app;
        console.log('Controller.js connected');
        // Expose endpoints to the app.
        this.requestValidation();
    }

    requestValidation() {
        this.app.post('/requestValidation', (req, res) => {
            res.send('/requestValidation connected').end();
        });
    }
}




module.exports = (params) => new Controller(params);