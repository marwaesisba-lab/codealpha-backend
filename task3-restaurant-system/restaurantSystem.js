// Initialization 

const express = require("express")
const Database = require("better-sqlite3")
const app = express()
const db = new Database('./task3-restaurant-system/restaurant.db');
// create Database 

db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT UNIQUE NOT NULL,
    quantity INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    reservation_time TEXT NOT NULL,
    FOREIGN KEY (table_id) REFERENCES tables (id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables (id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
  );
`);

// 1 - Get all menu items 
app.get("/api/menu-items", (req, res) => {
    const items = db.prepare("select * from menu_items").all()
    return res.json(items)
})
// 2 - Add menu Item 
app.post("/menu/add-menu", (req, res) => {
    const { name, price, category } = req.body
    if (!name || !price || !category) {
        return res.status(500).json({
            error: " cannnot add menu lack of informations "

        })
        // else info exsit
        const smnt = db.prepare('INSERT INTO menu_items (name, price, category) VALUES (?, ?, ?)')
        const infos = smnt.run(name, price, category)
        return res.status(201).json({
            message: " created new menu item  successfuly "
        })
    }

})

// Add / Update Inventory Stock
app.post("/api/inventory", (req, res) => {

})