let path = require('path'),
    truffle_contract = require('truffle-contract'),
    Web3 = require('web3'),
    PKWalletProvider = require('truffle-privatekey-provider'),
    HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
    /**
     * Init the object.
     *
     * @param host
     * @param private_key
     * @param custodian_path
     * @param seed
     */
    init: async function ({host, private_key, custodian_path, seed}) {
        let json;
        if (custodian_path === undefined) {
            json = require(path.join(__dirname, '../build/contracts/Custodian.json'));
        } else {
            json = require((path.join(__dirname, '../' + custodian_path)));
        }

        let provider;
        if (seed !== undefined) {
            console.log(" * Mnemonic provider * ");
            provider = new HDWalletProvider(seed, host, 0);
        } else if (private_key === undefined) {
            console.log(" * Geth provider * ");
            provider = new Web3.providers.HttpProvider(host)
        } else {
            console.log("* Private key *");
            console.log(host);
            provider = new PKWalletProvider(private_key, host);
        }

        let web3 = new Web3();
        web3.setProvider(provider);
        this.web3 = web3;

        let contract = truffle_contract(json);
        contract.setProvider(provider);
        this.contract = contract;
    },

    /**
     * Runs a bounty transfer allocation.
     *
     * @param wallet
     * @param amount
     * @param from
     * @returns {Promise.<TResult>}
     */
    transferBountyAllocation: function ({wallet, amount, from}) {
        return this.contract
            .deployed()
            .then((deployed_custodian) => {
                return deployed_custodian.transferAllocation(amount, wallet, 2, {from: from, gas: 100000});
            })
            .then((tx) => {console.log(tx); return tx;})
    },

    /**
     * Just a checker
     * @returns {Promise.<TResult>}
     */
    getBountySupply: function () {
        return this.contract
            .deployed()
            .then((deployed_custodian) => {return deployed_custodian.currentBountySupply()})
            .catch((error) => {console.log(error)});
    },
}