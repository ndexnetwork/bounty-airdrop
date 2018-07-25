# nDEX (NDX) Token Airdrop Distribution Script

The script distributes J8T tokens according to a CSV file with addresses and amounts. 

## About

1. Install code dependencies with npm.
```
npm install
```

2. Copy the ABI json file of the deployed contract into build/contracts folder.

3. The CSV file must follow the format below:
````
ADDRESS,AMOUNT
0x90F381951A093144Ab81DFed8Ad7E9156D309060,5000
0x2a55f45317a6Ed3bc8fC729aA1B445B2664DE1C8,10000
````

The system can run through several providers as a local geth or infura. These are some examples of each one.

**GETH as provider**
First open a command prompt with a geth and unblock an account. This is an example for a private blockchain.
```
geth --rpc --rpcapi db,eth,net,web3,personal --rpcport 9545 --networkid 987 --datadir privchain4 --unlock="0xd6B0BFE92bBB235a3ec9320Cc2A62385dd3FDD88" --mine --etherbase="0x90F381951A093144Ab81DFed8Ad7E9156D309060"
```
Finally, execute the script:
```
node bin/transfer-bounty.js run input.csv http://localhost:9545 --from=0xd6B0BFE92bBB235a3ec9320Cc2A62385dd3FDD88
```

**INFURA as provider**
```
node bin/transfer-bounty.js run input.csv https://rinkeby.infura.io/INFURA-TOKEN --from="ethereum address" --pk="private key of the ethereum address"
```

The script logs all information about the execution of the script: transactions id, errors, etc... If there was an error with a transaction the scripts writes all needed information in a new cvs file at `logs/` path.
