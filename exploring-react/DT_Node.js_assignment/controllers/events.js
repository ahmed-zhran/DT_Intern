//const CategoriesProducts  = require('../models/categoryProducts.model');
const DB = require('../config/db_connect').DB;
const db = DB.db("assignment");
const events = db.collection("events");
const { json } = require('express');
const mongodb = require('mongodb');
const fs = require('fs');
const PromiseHandler = require('../middleware/handlePromise');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////event routes/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//adding event
exports.event_create = PromiseHandler(async (req, res, next)=>{
    //ISO 8601 dates format as a string 
    //making rigor_rank integer
    if(req.body.rigor_rank) req.body.rigor_rank = parseInt(req.body.rigor_rank);

    var file;
    if(req.files){
        file = req.files.image;
        req.body.image = mongodb.Binary(req.files.image.data);
    }
    let event = await events.insertOne(req.body);
    if(file){
        file.mv(`uploads/${event.insertedId}.jpg`);
    }
    res.status(200).json({msg:"success",id: event.insertedId});
})

//updating event
exports.event_update = PromiseHandler(async (req, res, next)=>{
    if(req.body.rigor_rank)req.body.rigor_rank=parseInt(req.body.rigor_rank);
    var file;
    if(req.files){
        file = req.files.image;
        req.body.image = mongodb.Binary(req.files.image.data);
    }
    let id = new mongodb.ObjectId(req.params.id);
    let event = await events.findOneAndUpdate({_id : id},{$set:req.body},{new: true, upsert: false });
    if(event.value){
        if(file)
            file.mv(`uploads/${req.params.id}.jpg`);
        res.status(200).json({msg:"update success"});
    }
    else
        res.status(404).json({msg:"invalid id"});
})

//deleting an event
exports.event_delete = PromiseHandler(async (req, res, next)=>{
    let id = new mongodb.ObjectId(req.params.id);
    fs.unlink(`uploads/${req.params.id}.jpg`,(err)=> console.log(err));
    let event = await events.findOneAndDelete({_id : id});
    if(event.value)
        res.status(200).json({msg:"delete success"});
    else 
        res.status(404).json({msg:"invalid id"});
})

//getting event
exports.event_details = PromiseHandler(async (req, res, next)=>{
    let id = new mongodb.ObjectId(req.params.id);
    let event = await events.findOne({_id : id});

    if(event)
        res.status(200).json(event);
    else 
        res.status(404).json({msg:"invalid id"});
})

//getting all events sorted by time inserted to db and default limit of 5 with default page  (can send limit and page number by reqody)
exports.allEvents_details = PromiseHandler(async (req, res, next)=>{
    if(!req.params.page || req.params.page <= 0) req.params.page = 1;
    else req.params.page = parseInt(req.params.page);

    if(!req.params.limit || req.params.limit <= 0) req.params.limit = 5;
    else req.params.limit = parseInt(req.params.limit);

    let cnt = await events.estimatedDocumentCount(),
        wanted = await events
                            .find({})
                            .sort({_id:-1})
                            .limit(req.params.limit)
                            .skip((req.params.page -1) * req.params.limit)
                            .toArray();
    
    if(!wanted.length)
        res.status(404).json({res:{msg:"no data in this page",allcount: cnt, availablePages: Math.ceil(cnt / req.params.limit)}});
    else
        res.status(200).send({res:{allcount: cnt,pageNo:req.params.page,limitperpage:req.params.limit, availablePages: Math.ceil(cnt / req.params.limit)},data:wanted});
})
