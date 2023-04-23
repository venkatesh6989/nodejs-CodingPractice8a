const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "todoApplication.db");

let db = null;
console.log("It's Running...");
const initializationDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`Something Happend ${e.message}`);
  }
};

initializationDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

const hasPriorityAndStatusProperty = (reqQuery) => {
  return reqQuery.priority !== undefined && reqQuery.status !== undefined;
};

const hasPriorityProperty = (reqQuery) => {
  return reqQuery.priority !== undefined;
};

const hasStatusProperty = (reqQuery) => {
  return reqQuery.status !== undefined;
};

app.get("/todos/", async (req, res) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", status = "", priority = "" } = req.query;

  switch (true) {
    case hasPriorityAndStatusProperty(req.query):
      getTodosQuery = `
            SELECT * 
            FROM todo 
            WHERE 
            todo LIKE '${search_q}'
            AND status = '${status}'
            AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(req.query):
      getTodosQuery = `
            SELECT * 
            FROM todo 
            WHERE 
            todo LIKE '${search_q}'
            AND priority = '${priority}';`;
      break;
    case hasStatusProperty(req.query):
      getTodosQuery = `
            SELECT * 
            FROM todo 
            WHERE 
            todo LIKE '${search_q}'
            AND status = '${status}';`;
      break;
    default:
      `
            SELECT * 
            FROM todo 
            WHERE 
            todo LIKE '${search_q}';`;
      break;
  }
  data = await db.all(getTodosQuery);
  const convertData = data.map((dbObject) =>
    convertDbObjectToResponseObject(dbObject)
  );
  res.send(convertData);
});

//API 3 POST
app.post("/todos/", async (req, res) => {
  const todoDetails = req.body;
  const { id, todo, priority, status } = todoDetails;
  const postQuery = `INSERT INTO todo (id,todo,priority,status) VALUES (${id},'${todo}','${priority}', '${status}');`;
  const dbResponse = await db.run(postQuery);
  const ID = dbResponse.lastID;
  res.send("Todo Successfully Added");
});

//API 5 DELETE
app.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const postQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.get(postQuery);
  res.send("Todo Deleted");
  console.log("venky");
});

module.exports = app;
