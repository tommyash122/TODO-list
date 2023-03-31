const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const password = encodeURIComponent("@#542#9nkM#!9xS");

mongoose.connect("mongodb+srv://tommy122:" + password +"@cluster0.8v8heph.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
})

const item2 = new Item({
    name: "Hit the + button to add a new item."
})

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defalutItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defalutItems, function (err) {
                if (err)
                    console.log(err);
                else
                    console.log("Successfully added the items!");
            })
            res.redirect("/");
        }
        res.render("list", {
            listTitle: "Today",
            newListItems: foundItems
        });
    })


});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // Create a new list
                const list = new List(
                    {
                        name: customListName,
                        items: defalutItems
                    })
                list.save();
                res.redirect("/" + customListName)
            } else
                // Show an existing list
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
        }
    })


})

app.post("/", function (req, res) {
    const listName = req.body.list;
    const itemName = req.body.newItem;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName)
        })
    }


});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkBox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err)
                console.log(err)
            else
                console.log("Successfully deleted item!")
        })

        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }


})

app.get("/work", function (req, res) {
    res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
