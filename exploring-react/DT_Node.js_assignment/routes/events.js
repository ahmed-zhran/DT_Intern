const express = require("express");
const router = express.Router();
const events = require('../controllers/events');


//events routes:

//creates an event and returns the id of event created
router.post('/event', events.event_create);

//get an event by its unique id
router.get('/event/:id', events.event_details);

//get an event by its unique id
router.put('/event/:id', events.event_update);

//deleting an event by id
router.delete('/event/:id', events.event_delete);

//get all events
router.get('/events/:page/:limit', events.allEvents_details);




module.exports = router;
