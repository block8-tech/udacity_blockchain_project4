class Mempool {
    constructor () {
        this.mempool = [];
        this.mempoolValid = [];
        this.timeoutrequests = [];
        this.mempoolWindow = 5*60*1000;
        this.mempoolValidWindow = 30*60*1000;
        console.log(`Mempool initiated...`);
    }
}

module.export = new Mempool();