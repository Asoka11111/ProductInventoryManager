#!/usr/bin/env node

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'


import { Low, JSONFile } from 'lowdb'
import chalk from 'chalk';

import { usage, errorLog, prompt } from './utilities.js';


const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

const args = process.argv;

const invalidArgType = (a, et, pt) =>  {
    errorLog(`
    Invalid argument type for ${a}:
    
    Expected type: ${et}
    Provided type: ${pt}
    `);
}

const addProduct = async () => {
    const q = chalk.blue('type in the name of the product you want to add');
    const name = await prompt(q);
    if (typeof(name) !== 'string') {
        invalidArgType('product name', 'string', typeof(name));
        return;
    }

    const q2 = chalk.blue('now type in the SKU of the product you want to add');
    const SKU = await prompt(q2);
    if (typeof(SKU) !== 'string') {
        invalidArgType('SKU', 'string', typeof(SKU));
        return;
    }

    await db.read();
    const { products } = db.data;

    if (products[SKU]) {
        errorLog(`Product ${SKU} already exists`);
        return;
    }
    products[SKU] = name;

    await db.write();
}

const addWarehouse = async () => {
    const idQ = chalk.blue(`type in the id of the warehouse you want to add`);
    const id = parseInt(await prompt(idQ));
    if (typeof(id) !== 'number') {
        invalidArgType('warehouse #', 'number', typeof(id));
        return;
    }

    const stockLimitQ = chalk.blue(`type in the stock limit of the warehouse you want to add or press enter for no limit`);
    const stockLimit = parseInt(await prompt(stockLimitQ)) || null;
    if (stockLimit && typeof(stockLimit) !== 'number') {
        invalidArgType('stock limit', 'number', typeof(stockLimit));
        return;
    }

    await db.read();
    const { warehouses } = db.data;
    warehouses[id] = { stockLimit, products: {} };
    await db.write();
}

const stock = async () => {
    const skuQ = chalk.blue(`type in the SKU of the product you want to stock`);
    const SKU = await prompt(skuQ);
    if (typeof(SKU) !== 'string') {
        invalidArgType('SKU', 'string', typeof(SKU));
        return;
    }

    const idQ = chalk.blue(`type in the id of the warehouse you want to stock product(s) in`);
    const id = parseInt(await prompt(idQ));
    if (typeof(id) !== 'number') {
        invalidArgType('warehouse #', 'number', typeof(id));
        return;
    }

    const quantityQ = chalk.blue(`type in the quantity of the product you want to stock`);
    const q = parseInt(await prompt(quantityQ));
    if (typeof(q) !== 'number') {
        invalidArgType('quantity', 'number', typeof(q));
        return;
    }

    await db.read();
    const { warehouses } = db.data;

    if (!warehouses[id]) {
        errorLog(`Warehouse ${warehouseId} does not exist`);
        return;
    } else if (!warehouses[id].products) {
        warehouses[id].products = {
            [SKU]: { quantity: q }
        };
    } else if (!warehouses[id].products[SKU]) {
        warehouses[id].products = { ...warehouses[id].products, [SKU]: { quantity: q } };
    } else {
        warehouses[warehouseId].products[SKU] = {
            ...warehouses[warehouseId].products[SKU],
            quantity: warehouses[warehouseId].products[SKU].quantity + q
        };
    }
    await db.write();
}

const unstock = async () => {
    const skuQ = chalk.blue(`type in the SKU of the product you want to add`);
    const SKU = await prompt(skuQ);
    if (typeof(SKU) !== 'string') {
        invalidArgType('SKU', 'string', typeof(SKU));
        return;
    }

    const idQ = chalk.blue(`type in the id of the warehouse you want to add`);
    const id = parseInt(await prompt(idQ));
    if (typeof(id) !== 'number') {
        invalidArgType('warehouse #', 'number', typeof(id));
        return;
    }

    const quantityQ = chalk.blue(`type in the quantity of the product you want to add`);
    const q = parseInt(await prompt(quantityQ));
    if (typeof(q) !== 'number') {
        invalidArgType('quantity', 'number', typeof(q));
        return;
    }

    await db.read();
    const { warehouses } = db.data;

    if (!warehouses[id]) {
        errorLog(`Warehouse ${warehouseId} does not exist`);
        return;
    } else if (!warehouses[id].products){
        errorLog(`Warehouse ${warehouseId} has no products`);
        return;
    } else if (!warehouses[id].products[SKU]) {
        errorLog(`Product ${SKU} does not exist in warehouse ${id}`);
        return;
    } else {
        const unstockEffect = warehouses[id].products[SKU].quantity - q;
        const newQuantity = unstockEffect < 0 ? 0 : unstockEffect;
        warehouses[id].products[SKU] = {
            ...warehouses[warehouseId].products[SKU],
            quantity: newQuantity
        };
    }

    await db.write();
}
const listProducts = async () =>  {
    await db.read();
    const { products } = db.data;

    for (const product in products) {
        console.log(`${product} - ${products[product]}`);
    }
}

const listWarehouses = async () => {
    await db.read();
    const { warehouses } = db.data;

    console.log('WAREHOUSES');
    for (const warehouse in warehouses) {
        console.log(`Warehouse #${warehouse} with stock limit of ${warehouse.stockLimit}`);
    }
}

const listWarehouse = async () =>  {
    const idQ = chalk.blue(`type in the id of the warehouse you want to view`);
    const id = parseInt(await prompt(idQ));
    if (typeof(id) !== 'number') {
        invalidArgType('warehouse #', 'number', typeof(id));
        return;
    }

    await db.read();

    const { warehouses } = db.data;

    if (!warehouses[id]) {
        errorLog(`Warehouse ${id} does not exist`);
        return;
    }

    for (const product in warehouses[id].products) {
        console.log(`
        Item name: ${db.data.products[product]}
        Item SKU: ${product}
        QTY: ${warehouses[id].products[product].quantity}
        `);
    }
}

if(args.length > 3) {
    errorLog('only one command can be accepted')
    usage();
}

switch(args[2]) {
    case 'help':
        usage();
        break;
    case 'add_product':
        addProduct();
        break;
    case 'add_warehouse':
        addWarehouse();
        break;
    case 'stock':
        stock();
        break;
    case 'unstock':
        unstock();
        break;
    case 'list_products':
        listProducts();
        break;
    case 'list_warehouses':
        listWarehouses();
        break;
    case 'list_warehouse':
        listWarehouse();
        break;
    default:
        errorLog('Invalid command passed');
        usage();
        break;
}
