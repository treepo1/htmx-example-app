import TasksController from "./TasksController.js";
const app = express();

const tasksController = new TasksController();

app.get('/tasks', async (req,res) => {
   const result = await tasksController.execute(req,res);
   return result
})








