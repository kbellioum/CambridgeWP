var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


var Patient = require('../models/patient');




router.get('/', function(req, res, next) {
    res.render('addpatient', { title: 'New Parents' });
});


/*
router.route('/')

    // create a parents (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res) {

        var parents = new Parents();      // create a new instance of the Parents model
        parents.name = req.body.name;  // set the parents name (comes from the request)
        parents.birthdate = req.body.birthdate;
        parents.father = req.body.father;
        // save the parents and check for errors
        parents.save(function(err) {
            if (err)
                res.send(err);

            //res.json({ message: 'Parents created!' });
            res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("api");
                        // And forward to success page
                        res.redirect("/api");
                    },
                    //JSON response will show the newly created parents
                    json: function(){
                        res.json({ message: 'Parents created!' });
                    }
                });

        });
    });


*/


module.exports = router;
