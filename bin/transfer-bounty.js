let program = require('commander'),
    _ = require('colors'),
    fs = require('fs'),
    csv = require('csv-parser'),
    sleep = require('sleep'),
    Json2csvParser = require('json2csv').Parser,
    moment = require('moment'),
    custodian = require('../src/custodian');

program
    .command('run <file> <host>')
    .option('-f --from <from>', "From account in case to use geth")
    .option('-p --pk <pk>', "Private key in case using infura")
    .option('-p --path <path>', 'Build path')
    .option('-s --seed <seed>', 'Mnemonic seeder')
    .action(async (file, host, cmd) => {
        let from = cmd.from;
        let pk = cmd.pk;
        let path = cmd.path;
        let seed = cmd.seed;

        console.log("** Welcome to the J8T bounty airdrop distributor command ** " . rainbow);
        console.log('The file to read: '.blue +  file);
        console.log('The host: '.blue +  host);
        console.log('Transfer from account: '.blue +  from);
        console.log('Custodian contract path: '.blue +  path);
        console.log('Seed: '.blue + seed);

        custodian.init({host: host, private_key: pk, custodian_path: path, seed: seed});

        //Just a simple checker
        let bounty_supply = await custodian.getBountySupply();
        console.log("The current bounty supply is " + bounty_supply.toString());

        let transfers = [];
        fs
            .createReadStream(file)
            .pipe(csv())
            .on('data', (data) => transfers.push({address: data.ADDRESS, amount: data.AMOUNT}))
            .on('end', () => transferBounties(transfers, from));
    });

/**
 * Main logic for execute all transfers
 *
 * @param transfers
 */
let transferBounties = async (transfers, from) => {
    let errors = [];

    console.log("************************************ ".rainbow);
    console.log("** STARTING TRANSFERS ALLOCATIONS ** ".rainbow);
    console.log("************************************ ".rainbow);

    for (let i = 0; i < transfers.length; i++) {
        let transfer = transfers[i];
        let address = transfer.address;
        let amount = transfer.amount;
        console.log("");
        console.log("* Transfering ".red + amount + " tokens to ".red + address + ".".red);
        try {
            let tx = await custodian.transferBountyAllocation({wallet: address, amount: amount, from: from});
            console.log("** Tx: " + tx.tx);
        } catch (error) {
            console.log(error);
            console.log(error.toString());
            errors.push({ADDRESS: address, AMOUNT: amount, ERROR: error.toString()});
        }
    }
    saveErrors(errors);
}

/**
 * Save errors into CSV.
 *
 * @param errors
 */
let saveErrors = (errors) => {
    console.log("This are the compiled errors: " . red);
    console.log(errors)
    if (errors.length > 0) {
        try {
            let opts = {
                quote: ''
            };
            const parser = new Json2csvParser(opts);
            const csv_errors = parser.parse(errors);
            let now = moment().format();
            fs.writeFile('logs/error-' + now+ '.csv', csv_errors, 'utf8', function (err) {
                if (err) {
                    console.log('Some error occured - file either not saved or corrupted file saved.');
                } else{
                    console.log('It\'s saved!');
                }
            });
        } catch (err) {
            console.error(err);
        }
    }
}

program.parse(process.argv);