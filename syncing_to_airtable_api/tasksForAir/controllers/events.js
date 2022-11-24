//getting db staff
const DB = require('../config/db_connect').DB;
const db = DB.db("AirTableSync");
const events = db.collection("events");
const { json } = require('express');
const mongodb = require('mongodb');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
//for files
const fs = require('fs');

//promise handler middleware to handle requests uncatched errors
const PromiseHandler = require('../middleware/handlePromise');

/////getting airtable base for syncing with air table
const base = require('../config/airtable_connect');

//errors collector object
var syncingerrors = {
    errors: {},
    setError(err,from){
        this.errors.push({src:from, err:err});
        
    },
    getErrors(){
        return this.errors;
    },
    reset(){
        this.errors = [];
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////event routes/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//adding event
exports.event_create = PromiseHandler(async (req, res, next)=>{
    //ISO 8601 dates format as a string 
    //making rigor_rank integer
    if(req.body.rigor_rank) req.body.rigor_rank = parseInt(req.body.rigor_rank);
    req.body.createdAt = new Date();
    req.body.lastUpdatedAt = new Date();
    var file;
    if(req.files){
        console.log('here');
        file = req.files.image;
        req.body.image = new mongodb.Binary(req.files.image.data);
    }

    let event = await events.insertOne(req.body);
    if(file){
        file.mv(`uploads/${event.insertedId}.jpg`);
    }
    res.status(200).json({id: event.insertedId});
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
    req.body.lastUpdatedAt = new Date();
    let event = await events.findOneAndUpdate({_id : id},{$set:{...req.body,updated: true}},{new: true, upsert: false });
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
    let event = await events.findOneAndUpdate({_id : id},{$set:{deleted: true}},{new: true, upsert: false });
    if(event.value){
        res.status(200).json({msg:"delete success"});
    }
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
    if(!req.body.page) req.body.page = 1;
    else req.body.page = parseInt(req.body.page);

    if(!req.body.limit) req.body.limit = 5;
    else req.body.limit = parseInt(req.body.limit);

    let cnt = await events.estimatedDocumentCount(),
        wanted = await events
                            .find({})
                            .sort({_id:-1})
                            .limit(req.body.limit)
                            .skip((req.body.page -1) * req.body.limit)
                            .toArray();
    
    if(!wanted.length)
        res.status(404).json({msg:"no data in this page",allcount: cnt, availablePages: Math.ceil(cnt / req.body.limit)});
    else
        res.status(200).send({allcount: cnt,pageNo:req.body.page,limitperpage:req.body.limit,data:wanted});
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////syncing to air table route/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//syncingerrors is errors collecting object creating at the top

//updating unupdated aired undeleted records
async function update(){
    //updating unaired updates
    let updates = 0;
    let updatingdata = await events
                        .find({ recordID : { $exists : true }, deleted : { $exists : false }, updated: {$exists: true, $in: true} } )
                        .toArray();
    if(updatingdata.length){
        updates = updatingdata.length;
        await Promise.all(updatingdata.map(async event => {
            try{
                await base('sync with events db').update(event.recordID, {
                    "Name": event.name,
                    "_id": event._id,
                    "createdAt": event.createdAt,
                    "lastUpdatedAt": event.lastUpdatedAt,
                    "rigor_rank": event.rigor_rank
                });
                let id = new mongodb.ObjectId(event._id);
                await events.findOneAndUpdate({_id : id},{$set:{updated: false}},{new: true, upsert: false });
            }catch(err){
                await syncingerrors.setError(err,`updating function - in mapping data - updating ${event.recordID} in airtable to ${event._id} in db`);
                return;
            }
        }))
    }else updates = "no updated data";
    return updates;
}

//airing unaired undeleted records
async function add(){
    let added = 0;
    let addingdata = await events
                        .find({ recordID : { $exists : false } ,deleted : { $exists : false } })
                        .toArray();
    if(addingdata.length){
        added = addingdata.length;
        await Promise.all(addingdata.map(async event => {
            try{
                let addedEv = await base('sync with events db').create({
                    "Name": event.name,
                    "_id": event._id,
                    "createdAt": event.createdAt,
                    "lastUpdatedAt": event.lastUpdatedAt,
                    "rigor_rank": event.rigor_rank
                });
                let id = new mongodb.ObjectId(event._id);
                await events.findOneAndUpdate({_id : id},{$set:{recordID: await addedEv.getId(), updated: false}},{new: true, upsert: false });
            }catch(err){
                await syncingerrors.setError(err,`creating function - in mapping data - adding ${event._id} from db  to airtable ::${event.recordID}`);
                return;
            }
        }))
    }else added = "no data to sync";
    return added;
}

//removing aired and unaired deleted records
async function remove(){
    let removed = 0;
    let removedata = await events
                            .find({deleted: { $exists : true }})
                            .toArray();
    if(removedata.length){
        removed = removedata.length;
        await Promise.all(removedata.map( async(event) => {
            try{
                if(event.recordID)
                    await base('sync with events db').destroy(event.recordID);
                let id = mongodb.ObjectId(event._id);
                await events.findOneAndDelete({_id : id});
            }catch (err) {
                await syncingerrors.setError(err,`removing function - in mapping data - removing ${event.recordID} and ${event._id} from airtable and db respectively`);
                return;
            }
        }))
    }else removed = "no data to remove";
    return removed;
}

//sync to air table request
exports.sync_to_airtable = PromiseHandler(async (req, res, next) => {
    syncingerrors.reset();
    //not in air table and have recordID and deleted (draft data)
    Promise
        .all([await remove(), await update(), await add()])
        .then( async(value) =>{
            let response = {};
            //count of deleted
            response.deletedData = value[0];
            //count of updated
            response.updatedData = value[1];
            //count created
            response.createdData = value[2];

            if(syncingerrors.errors.length)
                res.status(400).json({catchedErrors: syncingerrors, response: response});
            else  
                res.status(200).json(response);
        })
    
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////syncing to DB route/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//syncingerrors is errors collecting object creating at the top

//updating unupdated stored undeleted records
async function update2(){
    //updating unaired updates
    let updates = 0;
    //query _id != null , updated = true, deleted = false
    let updatingdata = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}/sync%20with%20events%20db?filterByFormula=AND(%7Bdeleted%7D%3D0%2C%7Bupdated%7D%3D1%2CNOT(%7B_id%7D%3D%22null%22))`,{
        headers: {
            'Authorization' : 'Bearer ' + process.env.AIRTABLE_API_KEY,
            'content-type': 'application/json'
        }
    }).then((result) => result.json());

    //console.log(updatingdata.records);
    if(updatingdata.records.length){
        updates = updatingdata.records.length;
        await Promise.all(updatingdata.records.map(async event => {
            try{
                let id = new mongodb.ObjectId(event.fields._id);
                let obj = {
                    name: event.fields.Name,
                    rigor_rank: event.fields.rigor_rank,
                    lastUpdatedAt: new Date(event.fields.lastUpdatedOnAir)
                }
                await events.findOneAndUpdate({_id : id},{$set:obj},{new: true, upsert: false })
                            .catch((err) => console.log("here",err));

                await base('sync with events db').update(event.id, {
                    "updated": false
                });
            }catch(err){
                await syncingerrors.setError(err,`updating function - in mapping data - updating ${event.fields._id} in db to ${event.id} in airtable`);
                return;
            }
        }))
    }else updates = "no updated data";
    return updates;
}

//storing unstored undeleted records from air to db
async function add2(){
    let added = 0;
    //query _id = "null", deleted = 0 
    let addingdata = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}/sync%20with%20events%20db?filterByFormula=AND(%7Bdeleted%7D%3D0%2C%7B_id%7D%3D%22null%22)`,{
        headers: {
            'Authorization' : 'Bearer ' + process.env.AIRTABLE_API_KEY,
            'content-type': 'application/json'
        }
    }).then((result) => result.json());
    //console.log(addingdata.records);
    if(addingdata.records.length){
        added = addingdata.records.length;
        Promise.all( addingdata.records.map( async(event) => {
            try{
                let obj = {
                    "createdAt" : new Date(event.fields.createdOnAir),
                    "lastUpdatedAt" : new Date(event.fields.lastUpdatedOnAir),
                    "name": `${event.fields.Name}`,
                    "rigor_rank": event.fields.rigor_rank,
                    "recordID": event.id
                }
                let inserted = await events.insertOne(obj);
                //console.log(inserted.insertedId.toString());
                await base('sync with events db').update(event.id,{
                    "_id": inserted.insertedId.toString(),
                    "createdAt": event.fields.createdOnAir,
                    "lastUpdatedAt": event.fields.lastUpdatedOnAir,
                    "updated": false
                })
            }catch(err){
                await syncingerrors.setError(err,`creating function - in mapping data - adding ${event.id} from airtable  to db ::${event.fields._id}`);
                return;
            }
        }));
    }else added = "no data to sync";
    return added;
}

//removing deleted in air from air and db if stored
async function remove2(){
    let removed = 0;
    //query deleted = true
    let removedata = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}/sync%20with%20events%20db?filterByFormula=%7Bdeleted%7D%3D1`,{
        headers: {
            'Authorization' : 'Bearer ' + process.env.AIRTABLE_API_KEY,
            'content-type': 'application/json'
        }
    }).then((result) => result.json());

    //console.log(removedata.records);
    if(removedata.records.length){
        removed = removedata.records.length;
        await Promise.all(removedata.records.map( async(event) => {
            try{
                if(event.fields._id){
                    let id = mongodb.ObjectId(event.fields._id);
                    await events.findOneAndDelete({_id : id});
                }
                await base('sync with events db').destroy(event.id);
            }catch (err) {
                await syncingerrors.setError(err,`removing function - in mapping data - removing ${event.id} and ${event.fields._id} from airtable and db respectively`);
                return;
            }
        }))
    }else removed = "no data to remove";
    return removed;
}

//sync to db request
exports.sync_to_db = PromiseHandler(async (req, res, next) => {
    syncingerrors.reset();

    Promise
        .all([await remove2(), await update2(), await add2()])
        .then( async(value) =>{
            let response = {};
            //count of deleted
            response.deletedData = value[0];
            //count of updated
            response.updatedData = value[1];
            //count created
            response.createdData = value[2];

            if(syncingerrors.errors.length)
                res.status(400).json({catchedErrors: syncingerrors, response: response});
            else  
                res.status(200).json(response);
        })
    
})
