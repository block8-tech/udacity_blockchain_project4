class Mempool {
    constructor () {
        this.mempool = [];
        this.mempoolValid = [];
        this.timeoutrequests = [];
        this.mempoolWindow = 5*60*1000;
        this.mempoolValidWindow = 30*60*1000;
        console.log(`Mempool() initiated`);

    }

    print(params) {
        return new Promise( resolve =>  setTimeout(() => {
            resolve(console.log(params.msg));
        }, 2000));
    }

    //DONE
    getMempoolEntry(params) {
        const self = this;
        return new Promise((resolve, reject) => {
            const indx = self.mempool.map(i => i.walletAddress).indexOf(params.walletAddress);
            indx >= 0
                ? resolve(self.mempool[indx])
                : reject(false);
        });
    }

    setMempoolEntry(params) {
        const self = this;
        return new Promise((resolve, reject) => {
            //1. Setup some variables.
            const   {address : walletAddress} = params,
                    requestTimeStamp = new Date().getTime().toString().slice(0,-3),
                    message = `${walletAddress}:${requestTimeStamp}:starRegistry`,
                    validationWindow = self.mempoolWindow;

            //2. Create the object.
            const entry = {
                walletAddress,
                requestTimeStamp,
                message,
                validationWindow
            };

            //3. Push to the mempool.
            self.mempool.push(entry);

            //4. Create a timeout.
            self.timeoutrequests[walletAddress] = setTimeout(() => self.deleteFromMempool({walletAddress}), self.mempoolWindow);

            //5. Get the entry from the mempool adn return it.
            self.getMempoolEntry({walletAddress})
                .then(entry => resolve(entry))
                .catch(err => reject(err));
        });
    }

    mempoolIndex(params) {
        const self = this;
        return new Promise((resolve, reject) => {
            const indx = self.mempool.map(i => i.walletAddress).indexOf(params.walletAddress);
            indx >= 0
                ? resolve(indx)
                : reject(false);
        });
    }

    deleteFromMempool(params) {
        const self = this;
        return new Promise((resolve, reject) => {
            return self.mempoolIndex(params)
                .then(indx => self.mempool.splice(indx, 1))
                .then(arr => {
                    if(arr.length > 0) resolve(params);
                    if(arr.length === 0) reject({msg: `${params.walletAddress} was not deleted from the mempool. It could not be found.`});
                })
                .catch(e => console.log({ourErrorFrom_deleteFromMempool: e}));
        });
    }
}


module.export = new Mempool();