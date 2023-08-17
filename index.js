const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to database");
    connection.query(
      "CREATE TABLE IF NOT EXISTS tasks (id INT AUTO_INCREMENT PRIMARY KEY, description VARCHAR(255), status VARCHAR(255))",
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Table created successfully");
        }
      }
    );
  }
});

app.use(express.urlencoded({ extended: true }));

app.use("/", express.static("public"));

app.get("/tasks", (req, res) => {
  const { status } = req.query;
  connection.query(
    "SELECT * FROM tasks WHERE status = ?",
    [status],
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

app.get("/add-task", (req, res) => {
  const { status } = req.query;
  res.send(`
        <form hx-post="/add-task">
            <input id="description" type="text" name="description" >
            <input id="status" hidden type="text" name="status" value="${status}" >
            <button type="submit">Add</button>
        </form>
    `);
});

app.post("/add-task", (req, res) => {
  const { description, status } = req.body;
  connection.query(
    "INSERT INTO tasks (description, status) VALUES (?, ?)",
    [description, status],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error saving task");
      } else {
        res.redirect(`/tasks?status=${status}`);
      }
    }
  );
});

app.use(cors());

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
