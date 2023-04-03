const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use("/public", express.static("public"));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

    app.get("/detail/:id", async function (req, res) {
      const result = await docuCollection.findOne({
        _id: parseInt(req.params.id),
      });
      console.log(result);
      res.render("detail.ejs", { data: result });
    });

    app.get("/edit/:id", async function (req, res) {
      const result = await docuCollection.findOne({
        _id: parseInt(req.params.id),
      });
      res.render("edit.ejs", { post: result });
    });

    //POST
    app.post("/add", async function (req, res) {
      const { title, artist, star, comment, cover } = req.body;
      const { totalcounter } = await counterCollection.findOne({
        name: "count",
      });
      await docuCollection.insertOne({
        _id: totalcounter + 1,
        docuTitle: title,
        docuArtist: artist,
        docuStar: star,
        docuComment: comment,
        docuCover: cover,
      });
      await counterCollection.updateOne(
        { name: "count" },
        { $inc: { totalcounter: 1 } }
      );
      res.redirect("/");
    });

    // DELETE
    app.delete("/delete", async function (req, res) {
      req.body._id = parseInt(req.body._id);
      await docuCollection.deleteOne(req.body);
      res.status(200).send({ message: "성공" });
    });

    //PUT
    app.put("/edit", async (req, res) => {
      const { id, title, artist, star, comment, cover } = req.body;
      await docuCollection.updateOne(
        { _id: parseInt(id) },
        {
          $set: {
            docuTitle: title,
            docuArtist: artist,
            docuStar: star,
            docuComment: comment,
            docuCover: cover,
          },
        }
      );
      console.log("수정완료");
      res.redirect("/");
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
