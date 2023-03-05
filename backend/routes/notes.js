const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

//fectch all notes using get request: login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {


        const notes = await Notes.find({ user: req.user.id })
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})
//addnote of a user using post request: login required
router.post('/addnote', fetchuser, [
    body('title', 'enter a valid tile').isLength({ min: 3 }),
    body('description', 'enter atleat 5 char description').isLength({ min: 5 })
], async (req, res) => {

    try {


        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savednote = await note.save();

        res.json(savednote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})
router.put('/update/:id', fetchuser, async (req, res) => {
    const {title,description,tag}=req.body;
    try{
    const newNote={};
    if(title){
        newNote.title=title
    }
    if(description){
        newNote.description=description
    }
    if(tag){
        newNote.tag=tag;
    }
    let note= await Notes.findById(req.params.id);
    if(!note){
        return res.status(404).send("Not Found");
    }
    if(note.user.toString()!==req.user.id){
        return res.status(401).send("Not allowed");
    }
    note =await Notes.findByIdAndUpdate(req.params.id,{$set: newNote},{new :true});
    res.json({note});
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
}
})
router.put('/delete/:id', fetchuser, async (req, res) => {
    try{
    let note= await Notes.findById(req.params.id);
    if(!note){
        return res.status(404).send("Not Found");
    }
    note =await Notes.findByIdAndDelete(req.params.id);
    res.json({"Success":"note has been deleted"});
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
}
})
module.exports = router