import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

import chalk from 'chalk';


const usage = () => {
    const usageText = `
    Usage:
        ./index.js <command> [...args]

        commands can be:

        add_product <product name> <SKU>:
        This command adds a new product to our product catalog

        add_warehouse <warehouse #> [stock_limit]:
        Creates a new warehouse where we can stock products

        stock <product SKU> <warehouse #> <quantity>:
        Stocks QTY amount of product with SKU in WAREHOUSE# warehouse.

        unstock <product SKU> <warehouse #> <quantity>:
        Unstocks QTY amount of product with SKU in WAREHOUSE# warehouse.

        list_products:
        List all produts in the product catalog

        list_warehouses:
        List all warehouses

        list_warehouse <warehouse #>:
        List information about the warehouse with the given warehouse#
        along with a listing of all product stocked in the warehouse
    `;

    console.log(usageText);
}

const errorLog = (error) => {
    console.log(chalk.red(error));
}

const prompt = (question) => {
    const r = readline.createInterface({
        input,
        output,
        terminal: false,
    });

    return new Promise((resolve, reject) => {
        r.question(question, (answer) => {
            r.close();
            resolve(answer);
        });
    });
}

export { usage, errorLog, prompt }