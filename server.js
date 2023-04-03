const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use("/public", express.static("public"));

const { MongoClient } = require("mongodb");
const url =
  "mongodb+srv://pttc733:pttc@cluster0.bfc4pas.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);

async function main() {
  // Use connect method to connect to the server
  try {
    await client.connect();
    const docuCollection = client.db("favlist").collection("docu");
    const counterCollection = client.db("favlist").collection("counter");
    console.log("Connected successfully to server");

    // GET
    app.get("/", async (req, res) => {
      const query = docuCollection.find({});
      const result = (await query.toArray()).sort().reverse();
      res.render("list.ejs", { post: result });
    });

    app.get("/write", (req, res) => {
      res.render("write.ejs");
    });
  } finally {
    console.log("done");
  }
}

main().catch(console.dir);

// main()
//   .then(console.log)
//   .catch(console.error)
//   .finally(() => client.close());

// app.get("/", function (req, res) {
//   res.render("list.ejs");
// });

app.listen(3000, () => {
  console.log("서버실행");
});
