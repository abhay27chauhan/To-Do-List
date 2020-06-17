const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
// const workItems = [];
// const items = ["eat", "work", "sleep"];

app.set('view engine', 'ejs')

app.use(express.static("public"))

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb+srv://Abhay:Abhay27@cluster0-uplue.mongodb.net/todolistDB', { useUnifiedTopology: true, useNewUrlParser: true })

const itemsSchema = {
    name: {
        type: String,
        required: [true, "Please, check your data entry, no name is specified!"]
    }
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your To-do List!"
});

const item2 = new Item({
    name: "click the + button to add a new Line"
});

const item3 = new Item({
    name: "<-- Hit this to delete line"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    item: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
    
    const day = date.getDate();

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Successfully Inserted!");
                }
            })
            res.redirect("/")
        } else {
            res.render('list', { listType: day, addListItems: foundItems });
        }
    })

})

app.post("/", function(req, res){

    const itemName = req.body.addItem;
    const listName = req.body.list;

    const item = new Item({
           name: itemName
       })

    if (listName === date.getDate()){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.item.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        })
    }
       
    

})

app.post("/delete", function(req,res){
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === date.getDate()){
        Item.findByIdAndDelete(checkItemId, function (err) {
            if (!err) {
                console.log("Item Successfully Deleted");
            }
        })
        res.redirect("/");

    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: checkItemId}}}, function(err, foundList){
            if(!err){
                console.log("Successfully Deleted");
                res.redirect("/" + listName);
            }
        })
    }

    
})

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    item: defaultItems
                })
                list.save();

                res.redirect("/" + customListName);
            }else{
                res.render("list", { listType: foundList.name, addListItems: foundList.item })
            }
        }
    })
    
    
})

// app.get("/work", function(req, res){
//     res.render('list', {listType: "Work List", addListItems: workItems})
// })

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port);