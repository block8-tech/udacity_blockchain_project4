const bitcoinMessage = require('bitcoinjs-message');

class Mempool {
    constructor (state) {
        this.state = state;
        this.mempool = [];
        this.mempoolValid = [];
        this.timeoutrequests = [];
        this.mempoolWindow = 5 * 60 * 1000;
        this.mempoolValidWindow = 30 * 60 * 1000;

        console.log(`Mempool.js Mempool() code block initiated...`);
    }

    // Part 1.
    async mempoolGetOrSet(params) {
        const {walletAddress} = params;
        const indx = this.mempool.map(i => i.walletAddress).indexOf(walletAddress);
        if(indx >= 0  ) {
            console.log(`Mempool.js mempoolGetOrSet() code block running...`);
            return await this.mempoolGet({walletAddress})
        }
        if(indx === -1) {
            console.log(`Mempool.js mempoolGetOrSet() code block running...`);
            return await this.mempoolSet({walletAddress})
        }
    }
    async mempoolSet(params) {
        console.log(`Mempool.js mempoolSet() code block running...`);
        const self = this;
        const {walletAddress} = params;
        const requestTimeStamp = new Date().getTime().toString().slice(0,-3);
        const message = `${walletAddress}:${requestTimeStamp}:starRegistry`;
        const validationWindow = 300;
        const entry = {walletAddress, requestTimeStamp, message, validationWindow};
        this.mempool.push(entry);
        this.timeoutrequests[walletAddress] = setTimeout(() => self.removeFromMempool({walletAddress}), self.mempoolWindow);
        return await this.mempoolGet(params);
    }
    async mempoolGet(params) {
        console.log(`Mempool.js mempoolGet() code block running...`);
        const {walletAddress} = params;
        const indx = this.mempool.map(i => i.walletAddress).indexOf(walletAddress);
        const originalEntry = this.mempool[indx];
        const mutatedEntry = { ...originalEntry };
        mutatedEntry.validationWindow = await this.recalculateMempoolValidationWindow({entry:mutatedEntry});
        if(!originalEntry)                      return Promise.reject({err: `we could not find your wallet address in the mempool.`});
        if(mutatedEntry.validationWindow < 0 )  return Promise.reject({err: `validation window has expired.`});
        if(mutatedEntry.validationWindow >= 0)  return Promise.resolve(mutatedEntry);
    }




    // Part 2.
    async mempoolValidGetOrSet(params) {
        console.log(`Mempool.js mempoolValidGetOrSet() code block running...`);
        const {walletAddress} = params;
        const indx = this.mempoolValid.map(i => i.status.walletAddress).indexOf(walletAddress);
        if(indx >=   0) return await this.mempoolValidGet(params);//GET
        if(indx === -1) return await this.mempoolValidSet(params);//SET
        return Promise.reject({err: `An error occured trying to add OR retrieve your entry from the mempoolValid array.`});
    }
    async alreadyValid(params) {
        console.log(`Mempool.js alreadyValid() code block running...`);
        const {walletAddress} = params;
        const indx = this.mempoolValid.map(i => i.status.walletAddress).indexOf(walletAddress);
        if(indx >= 0) {
            const entry = await this.mempoolValidGet(params);
            return Promise.reject(entry); // reject to by-pass the promise chain and fall into the catch block.
        }
        if(indx === -1) return Promise.resolve(params);
    }
    async mempoolValidGet(params) {
        console.log(`Mempool.js mempoolValidGet() code block running...`);
        const {walletAddress} = params;
        const indx = this.mempoolValid.map(i => i.status.walletAddress).indexOf(walletAddress);
        if(indx >=   0) {
            const entry = this.mempoolValid[indx];
            const mutatedEntry = {...entry};
            mutatedEntry.status.validationWindow = await this.recalculateMempoolValidValidationWindow(mutatedEntry);
            return Promise.resolve(mutatedEntry);
        }
        if(indx === -1) return Promise.reject({err: `the wallet address could not be found in the valid mempool.`});
    }
    async mempoolValidSet(params) {
        console.log(`Mempool.js mempoolValidSet() code block running...`);
        return Promise.resolve(params)
            .then(params => this.verifyTimeLeft(params))
            .then(parmas => this.bitcoinMessageVerify(params))
            .then(params => this.removeTimeout(params))
            .then(result => result)
            .catch(err => err);
    }
    async verifyTimeLeft(params) {
        console.log(`Mempool.js verifyTimeLeft() code block running...`);
        const {walletAddress} = params;
        const entry = await this.mempoolGet({walletAddress});
        if (entry.validationWindow >= 0)    return Promise.resolve({...params, entry});
        if (entry.validationWindow <  0)    return Promise.reject({err: `validation window has expired.`});
        if (!entry)                         return Promise.reject({err: `the wallet address could not be found in the mempool.`});
    }
    async bitcoinMessageVerify(params) {
        console.log(`Mempool.js bitcoinMessageVerify() code block running...`);
        const {walletAddress, signature, entry} = params;
        // const isValid = bitcoinMessage.verify(entry.message, walletAddress, signature);
        const isValid = true; // for dev purposes.
        if(isValid === true) return Promise.resolve({registerStar: true, status: {...entry, messageSignature: true} });
        if(isValid === false) return Promise.reject({err: `signature did not pass validation checks.`});
    }
    async removeTimeout(params) {
        console.log(`Mempool.js removeTimeout() code block running...`);
        this.mempoolValid.push(params);
        await this.removeFromMempool(params);
        clearTimeout(this.timeoutrequests[params.walletAddress]);
        return Promise.resolve({...params});
    }



    // Part 3.
    async verifyVerification(params) {
        // Check if the address has been validated and appears in the mempoolValid array.
        // Do we need to check validation window here also???
        const {walletAddress} = params;
        const indx = this.mempoolValid.map(i => i.status.walletAddress).indexOf(walletAddress);
        if(indx >= 0) return Promise.resolve(params);
        if(indx === -1) return Promise.reject({err: `wallet address: ${walletAddress} has not been validated. please re-submit with signature.`});
        return Promise.reject({err: `there was an error trying to find the wallet address in the mempoolValid array.`});
    }


    async encodeBody(params) {
        const {walletAddress:address, star} = params;
        let body = {
            address,
            star
        };
        body.star.story = Buffer.from(params.star.story).toString('hex');
        return Promise.resolve({body});
    }


    async removeFromMempoolValid(block) {
        console.log(block.body.address)
        const indx = this.mempoolValid.map(i => i.status.walletAddress).indexOf(block.body.address);
        if(indx >= 0) {
            this.mempoolValid.splice(indx, 1);
            return block;
        }
    }










    /*********************************************************************************************************
    *  Helper methods...
    *********************************************************************************************************/
    async recalculateMempoolValidationWindow(params) {
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - params.entry.requestTimeStamp;
        let timeLeft = (this.mempoolWindow/1000) - timeElapse;
        return( timeLeft ); // left this extra line of code for clarity.
    }
    async recalculateMempoolValidValidationWindow(params) {
        console.log(`Mempool.js recalculateMempoolValidValidationWindow() code block running...`);
        console.log(params);
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - params.status.requestTimeStamp;
        let timeLeft = (this.mempoolWindow/1000) - timeElapse;
        return( timeLeft ); // left this extra line of code for clarity.
    }
    async removeFromMempool(params) {
        const {walletAddress} = params;
        const indx = this.mempool.map(i => i.walletAddress).indexOf(walletAddress);
        this.mempool.splice(indx,1);
        return Promise.resolve({...params});
    }

}


module.exports = (config) => new Mempool(config);