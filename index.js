const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");

const dotenv = require("dotenv");
let SQL = require("sql-template-strings");
dotenv.config();

let t = "hey"

const connection = mysql.createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to database");
  const statusTable = 'CREATE TABLE IF NOT EXISTS status (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), color CHAR(9));'
  const tasksTable = 'CREATE TABLE IF NOT EXISTS tasks (id INT AUTO_INCREMENT PRIMARY KEY, description VARCHAR(255), status_id INT,FOREIGN KEY (status_id) REFERENCES status(id));'
    connection.query(
      statusTable,
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Status Table created successfully");
        }
      }
    );
    connection.query(
      tasksTable,
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Tasks Table created successfully");
        }
      }
    );
  }
});

app.use(express.urlencoded({ extended: true }));

app.use("/", express.static("public"));

app.get("/tasks", (req, res) => {
  const { status_id } = req.query;
  connection.query(
    "SELECT * FROM tasks WHERE status_id = ?",
    [status_id],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving data from database");
      } else {
        let html = "<ul>";
        results.forEach((row) => {
          html += `<li class="task">${row.description}</li>`;
        });
        html += "</ul>";
        res.send(html);
      }
    }
  );
});


app.get("/status", (req, res) => {
  const status = connection.query(
    "SELECT * FROM status",
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving data from database");
      } else {
        let html = "";
        results.forEach((row) => {
          html += `
          <div hx-trigger="load" hx-get="/tasks?status_id=${row.id}" hx-target="#status${row.id}List" class="panel">
          <div style="border-top: 4px solid ${row.color}" class="headerPanel">
            <h4>${row.name}</h4>
          </div>
        
          <div class="task-list" id="status${row.id}List"></div>
          <button class="addTask" hx-swap="afterend" hx-trigger="click" hx-get="/add-task?status_id=${row.id}">
            New Task
          </button>
        </div>`


        });

        html += `<div id="addPanel" class="panel">
        <div class="headerPanelAdd" hx-get="/add-status" hx-trigger="click" hx-swap="outerHTML">
          <h4> + Add status</h4>
        </div>
      </div>`



        res.send(html);


      }
    })
});

app.get("/status/:id", (req, res) => {
  const { id } = req.params;
  console.log('e')
  connection.query(
    "SELECT * FROM status WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving data from database");
      } else {

        let html = "";
        results.forEach((row) => {
          html += `<div hx-trigger="load" hx-get="/tasks?status_id=${row.id}" hx-target="#status${row.id}List" class="panel">
          <div style="border-top: 4px solid ${row.color}" class="headerPanel">
            <h4>${row.name}</h4>
          </div>
        
          <div class="task-list" id="status${row.id}List"></div>
          <button class="addTask" hx-swap="afterend" hx-trigger="click" hx-get="/add-task?status_id=${row.id}">
            New task
          </button>
        </div>`
        });


        res.send(html);
      }
    }
  );
});







app.get("/add-task", (req, res) => {
  const { status_id } = req.query;
  res.send(`
        <form style="width:100%" hx-post="/add-task" hx-target="#status${status_id}List" >
            <input class="input" id="description" type="text" name="description" >
            <input id="status" hidden type="text" name="status_id" value="${status_id}" >
            <button class="btn" type="submit"  >Add</button>
            <button class="btn btn-red"  hx-get="/tasks?status_id=${status_id}" hx-target="closest form" hx-swap="delete">Cancel</button>
        </form>
    `);
});

app.post("/add-task", (req, res) => {
  const { description, status_id } = req.body;

  if (!description) {
    res.redirect(`/tasks?status_id=${status_id}`);
    return;
  }

  connection.query(
    "INSERT INTO tasks (description, status_id) VALUES (?, ?)",
    [description, status_id],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error saving task");
      } else {
        res.redirect(`/tasks?status_id=${status_id}`);
      }
    }
  );
});

app.get("/add-status", (req, res) => {
  res.send(`
        <form style="width:100%" hx-post="/add-status" hx-swap="innerHTML" hx-target="#statusPanel" >
            <input class="input" id="name" type="text" name="name" >
            <input value="#ffffff"  type="color" name="color" >
            <button class="btn" type="submit"  >Add</button>
            <button type="button" hx-trigger="click" class="btn btn-red" hx-target="closest form" hx-swap="delete">Cancel</button>
        </form>
    `);
});

app.post("/add-status", (req, res) => {
  const { name, color } = req.body;


  connection.query(
    "INSERT INTO status (name, color) VALUES (?, ?)",
    [name, color],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error saving status");
      } else {
        res.redirect(`/status`);
      }
    }
  );
});

app.use(cors());

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
