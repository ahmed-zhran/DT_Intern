const express = require("express");
const router = express.Router();
const events = require('../controllers/events');


//events routes:

//creates an event and returns the id of event created
router.post('/events', events.event_create);

//get an event by its unique id
router.get('/events/:id', events.event_details);

//get an event by its unique id
router.put('/events/:id', events.event_update);

//deleting an event by id
router.delete('/events/:id', events.event_delete);

//get all events
router.get('/events', events.allEvents_details);




module.exports = router;
