const express = require("express");
const path = require("path"); // Add this to handle file paths
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;
const cors = require("cors");

// Open a database connection
const db = new sqlite3.Database("./mydb.sqlite", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create or modify tables here
    db.run(
      "CREATE TABLE IF NOT EXISTS boards (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, color TEXT)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, board_id INTEGER)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS cards (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, board_id INTEGER)"
    );
  });
}

app.use(express.json());
app.use(cors());

// Serve static files from a specific directory
app.use(express.static("public")); // Assuming your HTML files are in a 'public' directory

// Endpoint to serve the board overview HTML file
app.get("/board-overview/:id", (req, res) => {
  const boardId = req.params.id;
  // Serve the HTML file for the board overview
  res.sendFile(path.join(__dirname, "public", "board-overview.html")); // Adjust the path according to your file structure
});

// GET route to fetch all cards
app.get("/cards", (req, res) => {
  db.all("SELECT * FROM cards", [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows); // Ensure this is always an array
  });
});
// POST route to create a new card
// POST route to create a new card within a list and board
app.post("/cards", (req, res) => {
  const { title, content, board_id } = req.body; // Include board_id in the request
  db.run(
    "INSERT INTO cards (title, content, board_id) VALUES (?, ?, ?)",
    [title, content, board_id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        id: this.lastID,
      });
    }
  );
});

// Additional routes for PUT and DELETE...
app.put("/cards/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  let updates = [];
  let values = [];

  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }

  if (content !== undefined) {
    updates.push("content = ?");
    values.push(content);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  const sql = `UPDATE cards SET ${updates.join(", ")} WHERE id = ?`;
  values.push(id);

  db.run(sql, values, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "success", data: req.body });
  });
});

app.delete("/cards/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM cards WHERE id = ?`, id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "deleted", id: id });
  });
});

// Assuming a 'lists' table exists in your database
app.post("/lists", (req, res) => {
  const { name, board_id } = req.body;
  console.log(board_id);
  db.run(
    "INSERT INTO lists (name, board_id) VALUES (?, ?)",
    [name, board_id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: "List created", id: this.lastID });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// GET route to fetch lists, optionally filtered by board_id
app.get("/lists", (req, res) => {
  let sql = "SELECT * FROM lists";
  const params = [];

  if (req.query.board_id) {
    sql += " WHERE board_id = ?";
    params.push(req.query.board_id);
  }
  console.log(req.query.board_id);
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// PUT route to update a list
app.put("/lists/:id", (req, res) => {
  const { id } = req.params;
  const { name, board_id } = req.body;

  let updates = [];
  let values = [];

  if (name !== undefined) {
    updates.push("name = ?");
    values.push(name);
  }

  if (board_id !== undefined) {
    updates.push("board_id = ?");
    values.push(board_id);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  const sql = `UPDATE lists SET ${updates.join(", ")} WHERE id = ?`;
  values.push(id);

  db.run(sql, values, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "List updated", id: id });
  });
});

app.delete("/lists/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM lists WHERE id = ?", id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "List deleted", id: id });
  });
});

// POST route to create a new board with color
app.post("/boards", (req, res) => {
  const { name, color } = req.body; // Assuming you've added a color column to your boards table
  db.run(
    "INSERT INTO boards (name, color) VALUES (?, ?)",
    [name, color],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      const boardId = this.lastID;
      // Handle creation of lists associated with this board if any
      // You'll need to pass the list of names in the request body and loop through them to create lists
      res.json({ message: "Board created", id: boardId });
    }
  );
});

app.get("/boards", (req, res) => {
  db.all("SELECT * FROM boards", [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET route to fetch a specific board by ID
app.get("/boards/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM boards WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Board not found" });
    }
  });
});
