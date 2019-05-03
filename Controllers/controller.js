const hex2ascii = require('hex2ascii');

class Controller {
    constructor (state) {
        // Pull in the state object.
        this.state = state;
        // Pull in the app.
        this.app = state.app;
        // Pull in the Mempool.
        this.mempool = state.mempool;
        // Pull in the db.
        this.db = state.db;


        // Expose endpoints to the app.
        this.home();
        this.addARequestValidation();
        this.validateRequestByWallet();
        this.verifyAddressRequest();
        this.getBlockByHash();
        this.getBlockByWalletAddress();
        this.height();

        console.log('Controller.js Controller() code block initiated...');
    }

    home () {
        this.app.get('/', (req, res) => {
            res.send('<h1>Application Started.</h1><br/><p><ul><li><a href="https://github.com/block8-tech/udacity_blockchain_project4">GitHub Repo</a></li></ul></p>').end();
            // res.redirect('https://github.com/block8-tech/udacity_blockchain_project4');
        });
    }

    // Part 1.
    addARequestValidation () {
        this.app.post("/requestValidation", async (req, res) => {
            console.log(`\ncontroller.js addARequestValidation() code block running...\n`);
            const {address: walletAddress} = req.body;
            const result = await this.mempool.mempoolGetOrSet({walletAddress});
            res.send(result).end();
        });
    }

    // Part 2.
    validateRequestByWallet () {
        this.app.post('/message-signature/validate', async (req, res) => {
            console.log(`\ncontroller.js validateRequestByWallet() code block running...\n`);

            const {address: walletAddress, signature} = req.body;

            return Promise.resolve({walletAddress, signature})
                .then(params => this.mempool.alreadyValid(params))
                .then(params => this.mempool.verifyTimeLeft(params))
                .then(params => this.mempool.bitcoinMessageVerify(params))
                .then(params => this.mempool.removeTimeout(params))
                .then(result => res.send(result).end())
                .catch(err => res.send(err).end())

        });
    }

    // Part 3.
    verifyAddressRequest () {
        this.app.post('/block', async (req, res) => {
            try {


                const {address: walletAddress, star} = req.body;


                if (
                    req.body.hasOwnProperty('address') &&
                    req.body.hasOwnProperty('star') &&
                    Object.keys(req.body).length === 2
                ) {
                    // VALID REQUEST BLOCK
                    return Promise.resolve({walletAddress, star})
                        .then(params => this.mempool.verifyVerification(params))
                        .then(params => this.mempool.encodeBody(params))
                        .then(body => this.db.addBlock(body))
                        .then(result => {
                            result.body.star.storyDecoded = hex2ascii(result.body.star.story);
                            return result;
                        })
                        .then(block => this.mempool.removeFromMempoolValid(block))
                        .then(result => res.send(result).end())
                        .catch(err => res.send(err).end())
                } else {
                    // INVALID REQUEST BLOCK
                    res.send({err: `your request has been rejected. please check your request body and ensure it only contains the specified fields`}).end();
                }
            } catch (err) {
                res.send({"ourErr in controller.js verifyAddressRequest()": `${err}`}).end()
            }
        });
    }

    // Additional functionalities  number 1.
    getBlockByHash() {
        this.app.get('/stars/hash:hash', async (req, res) => {

            const hash = req.params.hash.slice(1);
            const block = await this.db.getBlockByHash(hash);
            const parsedBlock = JSON.parse(block.value);
            parsedBlock.body.star.storyDecoded = hex2ascii(parsedBlock.body.star.story);

            res.send(parsedBlock).end();
        });
    }

    getBlockByWalletAddress() {
        this.app.get('/stars/address:address', async (req, res) => {

            const address = req.params.address.slice(1);

            const blocks = await this.db.getBlockByAddress(address);
            const parsedBlocks = blocks.map(i => JSON.parse(i.value));
            const finalBlocks = parsedBlocks.map(i => {
                const _block = {
                    ...i
                };
                _block.body.star.storyDecoded = hex2ascii(_block.body.star.story);
                return _block;
            });


            res.send(finalBlocks).end();
        });
    }

    height() {
        this.app.get('/height', async (req,res) => {
            res.send( {height: await this.db.getBlockHeight()} ).end()
        });
    }


}//END of the Controller Class.





module.exports = (state) => new Controller(state);