export default class TasksController {
  async execute(req, res) {
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
            html += `<li class='task'>${row.description}</li>`;
          });
          html += "</ul>";
          res.send(html);
        }
      }
    );
  }
}
