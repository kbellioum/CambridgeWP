
var express = require('express');
var bCrypt = require('bcrypt-nodejs');
var router = express.Router();


var Patient = require('../models/patient');
var Provider = require('../models/provider');
var Events = require('../models/events');
var Counter = require('../models/counter');
var Prog = require('../models/prog');
var Product = require('../models/product');
var Depot = require('../models/depot');
var Users = require('../models/user');
var Depotinout = require('../models/depotinout');

var Getdate = function(d){
   var out = d.substring(0, 10).split("-",3);
   var dd = out[1] + "/" + out[2] + "/" + out[0]
   return dd;
}

var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

var Gethour = function(h){
    var out = h.substring(11, 19);
    return out;
}

var tt;

var GetprodByExp = function(){

  Depot.findOne({depotname: "Siège"},function(err, depot){

    //console.log(depot.inout[0]);

    tt = depot.inout;

    console.log(tt);

    //return depot.inout[0];

  });

  return tt;

}

var SetisPatient = function(id){

	Events.findById(id, function (err, events){
		events.update({ isPatient: true,
			color: "#689F44"

		},function (err, eventsID){
			if(err){
				console.log('GET Error: There was a problem retrieving: ' + err );

			}else{

				console.log('Success');
			}
		})
	});

}

var facnum = "";

var Getcounter = function(){
  Counter.findById("57b1acb23e31e6c1948d010c", function (err, counter){
    var tt = counter.counter;
    tt = tt + 1;
    //counter.counter = tt;
    //var d = new Date();
    //var mask = "000000";
    //d.getDate() + "/" + (Number(d.getMonth())+1).toString() + "/" + d.getFullYear()
    //inc = d.getFullYear() + (Number(d.getMonth())+1).toString() +"-"+ mask.substring(0,6-tt.toString().length) + tt.toString();
    //console.log(tt);
    counter.update({
          counter: tt
    },function (err, counterID){
      if(err){
        console.log('GET Error: There was a problem retrieving: ' + err);
        //res.redirect('/home');
      }else{
        facnum = tt;
        console.log("Success" + " " + tt + " " + facnum);
        //res.render('/invoice', { user: req.user, counter: inc});

      }
    })

});
  console.log("Success2" + " " + facnum);
 return facnum;
}


var ConvertToUnit = function(qte, unittype){

    if (unittype == "Boîte"){
      return Number(qte) * 21;
    }else if (unittype == "Caisse"){
      return Number(qte) * 6 * 21;
    }else if(unittype == "Unité"){
      return Number(qte);
    }

}


var SetPrice = function(prog){

      /*
          @ PROG1--------- 3,490.00 Dhs ---> var a
          @ PROG2--------- 2,790.00 Dhs ---> var b
          @ PROG3--------- 1,990.00 Dhs ---> var c
          @ PROG4--------- 1,090.00 Dhs ---> var d
          @ PROG/Semaine--   790.00 Dhs ---> var e
          @ CONSULTATION--   300.00 Dhs ---> var f
          */


    var progprice = [
      {
        prog: "Prog 1",
        prix: ((3490 * 100)/120).toFixed(2),
        desc: "120 Unités"
      },
      {
        prog: "Prog 2",
        prix: ((2790 * 100)/120).toFixed(2),
        desc: "90 Unités"
      },
      {
        prog: "Prog 3",
        prix: ((1990 * 100)/120).toFixed(2),
        desc: "60 Unités"
      },
      {
        prog: "Prog 4",
        prix: ((1090 * 100)/120).toFixed(2),
        desc: "30 Unités"
      },
      {
        prog: "Cons 5",
        prix: ((300 * 100)/120).toFixed(2),
        desc: "CONSULTATION"
      },
      {
        prog: "Cons 6",
        prix: ((790 * 100)/120).toFixed(2),
        desc: "PROG/Semaine"
      }
    ];

    var price = progprice[Number(prog.substring(5,6))-1].prix;
    var desc = progprice[Number(prog.substring(5,6))-1].desc;

    return [price, desc];

}


var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});


	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true
	}));

	/* GET Registration Page */
	router.get('/signup', isAuthenticated, function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	});

	router.get('/invoice', isAuthenticated, function(req, res){


          var pid = req.query.id;
          var vid = req.query.vid;
          //console.log("index: " + index);
          var total = 0;
          var d = new Date().toISOString();
          Patient.findById(req.query.id, function(err, patient){
            for (i=0; i< patient.visites.length; i++){
              if((patient.visites[i].clotured === false) && (patient.visites[i]._id.toString() === vid.toString())){
              total = total + patient.visites[i].prix;
              var factnum = patient.visites[i].factnum;
              var discount = patient.visites[i].discount;
              }
            }
          var totalr = (total - ((total * discount)/100));

          if (err) {
              console.log('GET Error: There was a problem retrieving: ' + err);
          } else {
          res.render('invoice', {
             user: req.user,
             patient: patient,
             total: totalr,
             index: factnum,
             vid: vid,
             discount: discount,
             date: d.substring(0,10).split("-").reverse().join("/")
          });
          }

          });
  });
/*
	router.get('/invoice/:id', isAuthenticated, function(req, res){


    var index = Getcounter();
    //console.log("index: " + index);
    var total = 0;
    var d = new Date();
    Patient.findById(req.params.id, function(err, patient){
      for (i=0; i< patient.visites.length; i++){
        if(patient.visites[i].clotured === false){
        total = total + patient.visites[i].prix;
        }
      }


    if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
    } else {
    res.render('invoice', {
       user: req.user,
       patient: patient,
       total: total,
       index: index,
       remise: discount,
       date: d.getDate() + "/" + (Number(d.getMonth())+1).toString() + "/" + d.getFullYear()
    });
   }

   });

 	 //res.render('invoice', { user: req.user });
  });
*/
	router.get('/tabrdv', isAuthenticated, function(req, res){


    Events.find(function (err, events){
    var datenow =  new Date();
    var dtnow = datenow.toISOString();
    res.render('todayevents', { user: req.user, text: 'Tableau des RDVs', events: events, datenow: dtnow});
    });

  });

	router.get('/tabinst', isAuthenticated, function(req, res){
 	 res.render('tabinst', { user: req.user, text: 'Tableau des instances'});
  });

	router.get('/tabcons', isAuthenticated, function(req, res){

		Patient.find(function (err, patient){
		res.render('tabcons', { user: req.user, text: 'Tableau des consultations', patient: patient});
		});
  });





	router.get('/addvisite/:id', isAuthenticated, function(req, res){



		Patient.findById(req.params.id, function(err, patients){

    Product.find(function(err, product){
     Prog.find(function(err, prog){

       if (err) {
  				 console.log('GET Error: There was a problem retrieving: ' + err);
  		 } else {
  		 res.render('visite', {
  				user: req.user,
  				patients: patients,
          products: product,
          progs: prog
  		 });
  		}

     });



    });


		});

	});


  router.post('/addvisite/:id', isAuthenticated, function(req, res){

  Counter.findById("57b1acb23e31e6c1948d010c", function (err, counter){
    var tt = counter.counter;
    tt = tt + 1;
    //counter.counter = tt;
    var d = new Date();
    var mask = "000000";
    //d.getDate() + "/" + (Number(d.getMonth())+1).toString() + "/" + d.getFullYear()
    inc = d.getFullYear() + (Number(d.getMonth())+1).toString() +"-"+ mask.substring(0,6-tt.toString().length) + tt.toString();
    //console.log(tt);
    counter.update({
          counter: tt
    },function (err, counterID){
      if(err){
        console.log('GET Error: There was a problem retrieving: ' + err);
        //res.redirect('/home');
      }else{

        Prog.findOne({progname: req.body.prog}, function(err, prog){
          var obj = JSON.parse(req.body.obj);

          var facturenum = inc ;
          var visites = {
            poid: req.body.poid,
            taille: req.body.taille,
            prog: req.body.prog,
            daterdv: new Date(),
            prix: prog.progprice, //SetPrice(req.body.prog)[0],
            descprod: prog.progdesc, //SetPrice(req.body.prog)[1],
            comment: req.body.comment,
            consultant: req.user.lastName + " " + req.user.firstName,
            clotured: false,
            products: obj,
            factnum: facturenum
          };


          var numdossier = req.body.numdossier;

          Patient.findById(req.params.id, function (err, patients) {
            patients.visites.push(visites);

            patients.update({
              visites: patients.visites,
              numdossier: numdossier
            },function (err, patientsID){
              if(err){
                console.log('GET Error: There was a problem retrieving: ' + err);
                res.redirect('/home');
              }else{
                res.redirect("/viewpat/" + patients._id);
              }
            })
            //res.render('visite', { user: req.user, patients: patients});
          });
        });



      }
    })

  });

});



router.get('/listprog', isAuthenticated, function(req, res){

  Prog.find(function(err, prog){

    res.render('listprog', {user: req.user, progs: prog});

  });

});


router.get('/editprogone/:id', isAuthenticated, function(req, res){

  Prog.findById(req.params.id, function(err, prog){

    res.render('editprogone', {user: req.user, progs: prog});

  });

});


router.post('/editprogone/:id', isAuthenticated, function(req, res){


  Prog.findById(req.params.id, function (err, prog) {

    prog.update({
      progname: req.body.progname,
      progdesc: req.body.progdesc,
      progprice: req.body.progprice


    },function (err, progID){
      if(err){
        console.log('GET Error: There was a problem retrieving: ' + err);
        res.redirect('/editprogone' +  prog._id);
      }else{
        res.redirect("/listprog/");
      }
    })

   });





});





router.delete('/listprog/:prog_id', isAuthenticated, function(req, res){

  Prog.remove({
    _id: req.params.prog_id
  }, function(err, prog) {
    if (err)
      res.send(err);

    res.json({ message: 'Prog successfully deleted!' });
  });
});



  router.get('/cloture/:id', isAuthenticated, function(req, res){

    var vid = req.query.vid;
    var pid = req.query.pid;

    Patient.findById(req.params.id,function(err, patients){


        for (var i=0; i < patients.visites.length; i++){
              if(patients.visites[i]._id.toString() === vid.toString()){
                var tt = patients.visites[i];
                tt.clotured = true;
                patients.visites[i] = tt;
              }
        }
        patients.update({
          visites: patients.visites
        },function (err, patientsID){
          if(err){
            console.log('GET Error: There was a problem retrieving: ' + err);
            res.redirect('/home');
          }else{
            res.redirect("/tabcons");
          }
        })

      });


  });


  router.get('/addremise/:id', isAuthenticated, function(req, res){

    var vid = req.query.vid;
    var pid = req.query.pid;
    var discount = req.query.discount;


    console.log(discount);

    Patient.findById(req.params.id,function(err, patients){


        for (var i=0; i < patients.visites.length; i++){
              if(patients.visites[i]._id.toString() === vid.toString()){
                var tt = patients.visites[i];
                tt.discount = discount;
                patients.visites[i] = tt;
              }
        }
        patients.update({
          visites: patients.visites
        },function (err, patientsID){
          if(err){
            console.log('GET Error: There was a problem retrieving: ' + err);
            res.redirect('/home');
          }else{
            res.redirect("/tabcons");
          }
        })

      });


  });

  router.post('/addremise/:id', isAuthenticated, function(req, res){

    var vid = req.query.vid;
    var pid = req.query.pid;
    var discount = req.body.discount.match(/\d+/)[0];


    console.log(discount);

    Patient.findById(req.params.id,function(err, patients){


        for (var i=0; i < patients.visites.length; i++){
              if(patients.visites[i]._id.toString() === vid.toString()){
                var tt = patients.visites[i];
                tt.discount = discount;
                patients.visites[i] = tt;
              }
        }
        patients.update({
          visites: patients.visites
        },function (err, patientsID){
          if(err){
            console.log('GET Error: There was a problem retrieving: ' + err);
            res.redirect('/home');
          }else{
            res.redirect("/tabcons");
          }
        })

      });


  });




	router.get('/addpat', isAuthenticated, function(req, res){
	 console.log(req.query.eventsid);

	 if(req.query.eventsid !== undefined){

	 			SetisPatient(req.query.eventsid);

	 }

 	 res.render('addpat', { user: req.user, nom: req.query.nom, prenom: req.query.prenom, phone: req.query.phone});
  });

	router.post('/addpat', isAuthenticated, function(req, res){

/*				if(req.query.eventsid !== undefined){

						SetisPatient(req.query.eventsid);

			 }*/

        //SetisPatient(req.query.eventsid);

		    var patient = new Patient();
		    patient.patientnom = req.body.name;
		    patient.patientprenom = req.body.prenom;
				patient.email = req.body.email;
        patient.ville = req.body.ville;
				patient.occupation = req.body.occupation;
				patient.telephone = req.body.phone;
				patient.textarea = req.body.textarea;
				patient.cin = req.body.cin;
				patient.dob = req.body.dob;
				patient.statu = req.body.statu;
				patient.alergies = req.body.alergies;
				patient.poidinit = req.body.poid;
				patient.tailleinit = req.body.taille;
				patient.bmiinit = req.body.bmi; //((patient.poidinit/(patient.tailleinit/100*patient.tailleinit/100)).toPrecision(2))
        patient.question1 = req.body.question1;
        patient.question2 = req.body.question2;
        patient.question3 = req.body.question3;

		    patient.save(function(err) {
		        if (err)
		            res.send(err);

						res.redirect('/listpat');
		    });
  });
/*show lispat*/
	router.get('/listpat', isAuthenticated, function(req, res){

		    Patient.find(function (err, patient){
		    res.render('listpat', { user: req.user, patient: patient});
		  });
  });



	router.delete('/listpat/:patient_id', isAuthenticated, function(req, res){

		Patient.remove({
			_id: req.params.patient_id
		}, function(err, patient) {
			if (err)
				res.send(err);

		  res.json({ message: 'Parents successfully deleted!' });
	  });
  });

  router.get('/editpat/:id', isAuthenticated, function(req, res){
		Patient.findById(req.params.id, function(err, patients){

		 if (err) {
				 console.log('GET Error: There was a problem retrieving: ' + err);
		 } else {
		 res.render('editpat', {
				user: req.user,
				patients: patients
		 });
		}

		});

	});

  router.post('/editpat/:id', isAuthenticated, function(req, res){

		var name = req.body.name;
		var prenom = req.body.prenom;
		var email = req.body.email;
		var ville = req.body.ville;
		var alergies = req.body.alergies;
		var taille = req.body.taille;
		var poid = req.body.poid;
		var bmi = req.body.bmi;
		var occupation = req.body.occupation;
		var phone = req.body.phone;
		var textarea = req.body.textarea;
		var cin = req.body.cin;
		var dob = req.body.dob;
		var statu = req.body.statu;
    var question1 = req.body.question1;
    var question2 = req.body.question2;
    var question3 = req.body.question3;

		Patient.findById(req.params.id, function (err, patients) {
      console.log(question1);
      console.log(question2);
      console.log(question3);
			patients.update({
				patientnom: name,
				patientprenom: prenom,
				email: email,
				ville: ville,
				alergies: alergies,
				tailleinit: taille,
				poidinit: poid,
				bmiinit: bmi,
				occupation: occupation,
				telephone: phone,
				textarea: textarea,
				cin: cin,
				dob: dob,
				statu: statu,
        question1: question1,
        question2: question2,
        question3:  question3
			},function (err, patientsID){
				if(err){
					console.log('GET Error: There was a problem retrieving: ' + err);
					res.redirect('/listpat');
				}else{
					res.redirect("/viewpat/" + patients._id);
				}
			})

		 });





	});




	router.get('/addrdv', isAuthenticated, function(req, res){
 	 res.render('addrdv', { user: req.user, text: 'Ajout des RDVs'});
  });

	router.post('/addrdv', isAuthenticated, function(req, res){

		   var events = new Events();
			 events.title = req.body.name + " " + req.body.prenom;
			 var startdate = req.body.daterdv.split("/", 3);
			 var starthour = req.body.heurerdv.split(":", 3);
			 events.start = startdate[2]+"-"+startdate[0]+"-"+startdate[1]+"T"+starthour[0]+":"+starthour[1]+":"+starthour[2]+".000Z";
			 events.end = startdate[2]+"-"+startdate[0]+"-"+startdate[1]+"T"+starthour[0]+":"+(Number(starthour[1])+20).toString()+":"+starthour[2]+".000Z";
			 //2016-08-15T12:00:00.000Z
			 events.phone = req.body.phone;
		   events.allDay = false;
			 events.isPatient = false;
			 events.color = "#44689F";



			 events.save(function(err) {
		 			if (err)
		 					res.send(err);

		 			res.redirect('/listrdv');
		 	  });

  });

  router.get('/addrdv/:id', isAuthenticated, function(req, res){


     Patient.findById(req.params.id, function (err, patient) {
       var title = patient.patientnom + " " + patient.patientprenom;
       res.render('oldpataddrdv', { user: req.user, patient: patient, title: title});

      })

  });



  router.post('/addrdv/:id', isAuthenticated, function(req, res){


     Patient.findById(req.params.id, function (err, patient) {

       var events = new Events();
			 events.title = patient.patientnom + " " + patient.patientprenom;
			 var startdate = req.body.end.split("/", 3);
			 var starthour = req.body.start.split(":", 3);
       console.log(startdate);
			 events.start = startdate[2]+"-"+startdate[0]+"-"+startdate[1]+"T"+starthour[0]+":"+starthour[1]+":"+starthour[2]+".000Z";
			 events.end = startdate[2]+"-"+startdate[0]+"-"+startdate[1]+"T"+starthour[0]+":"+(Number(starthour[1])+20).toString()+":"+starthour[2]+".000Z";
			 //2016-08-15T12:00:00.000Z
			 events.phone = patient.telephone;
		   events.allDay = false;
			 events.isPatient = true;
			 events.color = "#689F44";

       events.save(function(err) {
            if (err)
                res.send(err);

            res.redirect('/listrdv');
          });

     })

      //res.send("OK OK");

  });

	router.get('/listrdv', isAuthenticated, function(req, res){
   res.render('listrdv', { user: req.user, text: 'Listes des RDVs'});
  });

  router.get('/events', isAuthenticated, function(req, res){
			Events.find(function (err, events){
			res.send(events);
		});
  });

	router.get('/getpatients', isAuthenticated, function(req, res){
			Patient.find(function (err, patient){
			res.send(patient);
		});
  });


	router.get('/test', isAuthenticated, function(req, res){



    res.render('test', {user: req.user, tt: "Prog 1"});


  });


	router.get('/editrdv/:id', isAuthenticated, function(req, res){

/*     Events.findById(req.params.id, function (err, events) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            console.log('GET Retrieving ID: ' + events._id);
							console.log(events.title.split(" ",2));


	                       var tab = events.title.split(" ", 2);
												 console.log(tab[0]);
												 console.log(tab[1]);
	                       res.render('editrdv', { user: req.user,
	                          nom: tab[0],
														prenom: tab[1],
														start: events.start,
														end: events.end,
														phone: events.phone,
														allDay: events.allDay
	                      });



	        }
	    });*/


			Events.findById(req.params.id, function(err, events){
/*
				res.render('editrdv', { user: req.user,
					 title: events.title,
					 start: events.start,
					 end: events.end,
					 phone: events.phone,
					 allDay: events.allDay,
					 id: events._id
			 });
			 */
			 var hh = Gethour(events.start);
			 var dd = Getdate(events.end);
			 if (err) {
					 console.log('GET Error: There was a problem retrieving: ' + err);
			 } else {
			 res.render('editrdv', {
				  user: req.user,
					events: events,
					start: hh,
					end: dd
			 });
		 	}

			});

	});

  router.get('/editevents/:id', isAuthenticated, function(req, res){

		Events.findById(req.params.id, function(err, events){

			res.render('events', {
				 title: events.title,
				 start: events.start,
				 end: events.end,
				 phone: events.phone,
				 allDay: events.allDay,
				 id: events._id
		 });
		});


	});

/*
  router.post('/editevents/:id', isAuthenticated, function(req, res){

		var title = req.body.titlef;
		var start = req.body.startf;
		var phone = req.body.phonef;
		var end = req.body.endf;
		var allDay = req.body.allDayf;


		Events.findById(req.params.id, function (err, events){
			events.update({
						title: title,
						start: start,
						end: end,
						phone: phone,
						allDay: allDay
			},function (err, eventsID){
				if(err){
					console.log('GET Error: There was a problem retrieving: ' + err );
					res.redirect('/listrdv');
				}else{
					res.redirect("/editevents/" + events._id);
				}
			})
		});



	});
*/



	router.post('/editrdv/:id', isAuthenticated, function(req, res){

		 /*var nom = req.body.name;
		 var prenom = req.body.prenom;*/
		 var title = req.body.title;
		 var phone = req.body.phone;
		 var startdate = req.body.end.split("/", 3);
		 var starthour = req.body.start.split(":", 3);
		 var start = startdate[2]+"-"+startdate[0]+"-"+startdate[1]+"T"+starthour[0]+":"+starthour[1]+":"+starthour[2]+".000Z";
		 var end = startdate[2]+"-"+startdate[0]+"-"+startdate[1]+"T"+starthour[0]+":"+(Number(starthour[1])+20).toString()+":"+starthour[2]+".000Z";
     //2016-08-15T12:00:00.000Z

		 //var start = req.body.start;
		 //var end = req.body.end;
		 //var id = req.params.id;


		 Events.findById(req.params.id, function (err, events) {

			 events.update({
				     title: title,
						 start: start,
						 end: end,
						 allDay: false,
						 phone: phone
			 },function (err, eventsID){
				 if(err){
					 console.log('GET Error: There was a problem retrieving: ' + err);
					 res.redirect('/listrdv');
				 }else{
					 res.redirect("/listrdv");
				 }
			 })

			});

	});


	router.get('/viewpat/:id', isAuthenticated, function(req, res){

     Patient.findById(req.params.id, function (err, patient) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            //console.log('GET Retrieving ID: ' + patient._id);
							res.render('viewpat', { user: req.user,
								nom: patient.patientnom,
								prenom: patient.patientprenom,
								email: patient.email,
								phone: patient.telephone,
								cin: patient.cin,
								ville: patient.ville,
								dob: patient.dob,
								poid: patient.poidinit,
								taille: patient.tailleinit,
								// ((poid/(taille/100*taille/100)).toPrecision(2))
								bmi: ((patient.poidinit/(patient.tailleinit/100*patient.tailleinit/100)).toPrecision(2)),
								occupation: patient.occupation,
								statu: patient.statu,
								numdossier: patient.numdossier,
								id: patient._id,
							  visites: patient.visites });

	        }
	    });

	});

	router.get('/events/:id', isAuthenticated, function(req, res){

     Events.findById(req.params.id, function (err, events) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            //console.log('GET Retrieving ID: ' + patient._id);
							res.render('events', { user: req.user,
								title: events.title,
								start: events.start,
								end: events.end,
								phone: events.phone,
								allDay: events.allDay

							});
						}
	    });

	});



  router.post('/counter', isAuthenticated, function(req, res){

		   var counter = new Counter();
       counter.counter = 1;
       counter.name = "Facturation";


			 counter.save(function(err) {
		 			if (err)
		 					res.send(err);

          res.redirect('/counter');
		 	  });



  });

  router.get('/listsessions', isAuthenticated, function(req, res){
      console.log(req.session);
      res.render('listsessions', {user: req.user, session: req.session.passport});

      /*var sess = req.session
      if (sess.views) {
        sess.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + sess.views + '</p>')
        res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
        res.end()
      } else {
        sess.views = 1
        res.end('welcome to the session demo. refresh!')
      }*/
  });



 router.get('/editprog', isAuthenticated, function(req, res){
   Prog.find(function (err, prog){

   Product.find(function(err, product){

     Depot.find({depotname: 'Siege' }, function(err, depot){
       //console.log(depot);
       res.render('editprog', {user: req.user, progs: prog, products: product, depot: depot});
       //res.send(JSON.stringify(depot));
     }).limit(10);

   });

   });

    });




 router.post('/updateprogdetail', isAuthenticated, function(req, res){

   var obj = JSON.parse(req.body.obj);
   var progone = req.body.progname.toString();

   Prog.findOne({progname: progone}, function(err, prog){
     for(i=0; i < obj.length; i++){
       prog.products.push(obj[i]);
     }

     prog.update({
       products: prog.products
     }, function (err, progID){
       if(err){
         console.log('GET Error: There was a problem retrieving: ' + err);
         res.redirect('/home');
       }else{
         res.redirect("/editprog");
       }
     })

   });


 });


 router.get('/addprog', isAuthenticated, function(req, res){
   res.render('addprog', {user: req.user});
 });


 router.post('/addprog', isAuthenticated, function(req, res){


       var prog = new Prog();
       prog.progname = req.body.progname;
       prog.progprice = req.body.progprice;
       prog.progdesc = req.body.progdesc;
       prog.maxunite = req.body.maxunite;

       console.log(prog);

       prog.save(function(err) {
           if (err)
               res.send(err);

           res.redirect('/listprog');
       });
 });

 router.post('/addprod', isAuthenticated, function(req, res){


       var product = new Product();


       product.prodname = req.body.prodname;
       product.prodcode = req.body.prodcode;
       product.extra = req.body.extra ? true : false;
       product.qtemin = req.body.qtemin;

       console.log(product.extra);



      product.save(function(err) {
           if (err)
               res.send(err);

           res.redirect('/listprod');
       });

 });

 router.get('/listprod', isAuthenticated, function(req, res){
   Product.find(function (err, prod){
     res.render('listprod', {user: req.user, prods: prod});
   });

 });





 router.get('/listinout', isAuthenticated, function(req, res){
      Depotinout.find(function(err, result){
       console.log(result);
       res.render('listinout', {user: req.user, inout: result});
       //res.json(result);
     });


 });

router.get('/productstock', isAuthenticated, function(req, res){

      res.render('productstock', {user: req.user});

});

 router.get('/stockin', isAuthenticated, function(req, res){
   var dt = new Date().toISOString();
   //s.split("").reverse().join("")
  Provider.find(function (err, provider){
   Product.find(function(err, prod){
     Depot.find(function(err, depot){
       res.render('stockin', {user: req.user, prods: prod, depots: depot, providers: provider,dt: dt.substring(0,10).split("-").reverse().join("/")});
     });
    });
  });

 });





 router.post('/stockin', isAuthenticated, function(req, res){

   console.log("debut post stockin");
   var datesys = new Date();

   var depotinout = new Depotinout();

   var ss = req.body.prodinfo.split('|');

    depotinout.depotname = req.body.depot;
    depotinout.prodid = ss[0].trim();
    depotinout.prodcode = ss[1].trim();
    depotinout.prodname = ss[2].trim();
    depotinout.prodqteinit = Number(req.body.prodqte);
    depotinout.prodqtemv = ConvertToUnit( Number(req.body.prodqte), req.body.produnite);
    depotinout.produnite = req.body.produnite;
    depotinout.datein = (datesys.getDate() + '/' + (datesys.getMonth()+1) + '/' +  datesys.getFullYear() + ':' + datesys.getHours()+ 'h' + datesys.getMinutes() + 'mm');
    depotinout.dateexp = req.body.dateexp;
    depotinout.dateachat = req.body.dateachat;
    depotinout.prixachat = Number(req.body.prixachat);
    depotinout.prixvente = Number(req.body.prixvente);
    depotinout.fournisseur = req.body.fournisseur;
    depotinout.numbc = req.body.numbc;
    depotinout.numbl = req.body.numbl;
    depotinout.motifin = "ACHAT NORMAL";

    depotinout.save(function(err){
       if (err)
           res.send(err);

       res.redirect('/listinout');
       //res.json("OK success");
   });

 });
 router.delete('/listinout/:stockin_id', isAuthenticated, function(req, res){
    Depotinout.remove({
      _id: req.params.stockin_id
    }, function(err, stockin) {
      if (err)
        res.send(err);

      res.json({ message: 'stockin successfully deleted!' });
    });
  });

  router.get('/editstockin/:id', isAuthenticated, function(req, res){

    var dt = new Date().toISOString();
    Provider.find(function (err, provider){
        Product.find(function(err, prod){
          Depot.find(function(err, depot){
            Depotinout.findById(req.params.id, function(err, stockin){
         		   if (err) {
                 console.log('GET Error: There was a problem retrieving: ' + err);
               } else {
                 res.render('editstockin', {user: req.user,providers: provider, prods: prod, depots: depot,stockin: stockin, dt: dt.substring(0,10).split("-").reverse().join("/")});
               }
         });
        });
      });
    });
	});

  router.post('/editstockin/:id', isAuthenticated, function(req, res){
    var ss = req.body.prodinfo.split('|');
    var  prodidv = ss[0].trim();
    var  prodcodev = ss[1].trim();
    var  prodnamev = ss[2].trim();
    Depotinout.findById(req.params.id, function (err, stockin) {
    var totalqteout=0;
      for(j=0; j < stockin.out.length; j++){
        totalqteout=totalqteout + Number(stockin.out[j].qteout);
      }
      stockin.update({

         depotname: req.body.depot,
         prodid: prodidv,
         prodcode: prodcodev,
         prodname: prodnamev,
         prodqteinit: Number(req.body.prodqte),
         prodqtemv:ConvertToUnit( Number(req.body.prodqte), req.body.produnite) - totalqteout,//ConvertToUnit( Number(req.body.prodqte), req.body.produnite),
         produnite: req.body.produnite,
         //datein = (datesys.getDate() + '/' + (datesys.getMonth()+1) + '/' +  datesys.getFullYear() + ':' + datesys.getHours()+ 'h' + datesys.getMinutes() + 'mm');
         dateexp: req.body.dateexp,
         dateachat: req.body.dateachat,
         prixachat: Number(req.body.prixachat),
         prixvente: Number(req.body.prixvente),
         fournisseur: req.body.fournisseur,
         numbc: req.body.numbc,
         numbl: req.body.numbl,
         motifin: "ACHAT NORMAL"

      },function (err, stockinID){
        if(err){
          console.log('GET Error: There was a problem retrieving: ' + err);

        }else{
          res.redirect("/listinout");
        }
      })

     });
     });

 router.get('/stockout/:id', isAuthenticated, function(req, res){
  // var dt = new Date().toISOString();
   Depotinout.findById(req.params.id, function(err, stockin){
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        res.render('stockout', {user: req.user, stockin:stockin});
      }
   });
});

router.post('/stockout/:id', isAuthenticated, function(req, res){
var datesys = new Date();
var qte=req.body.qteout;

 var stockout = {
  qteout: req.body.qteout,
  dateout: (datesys.getDate() + '/' + (datesys.getMonth()+1) + '/' +  datesys.getFullYear() + ':' + datesys.getHours()+ 'h' + datesys.getMinutes() + 'mm'),
  motifout: "VENTE NORMALE"
};
Depotinout.findById(req.params.id, function (err, stockin) {
  stockin.out.push(stockout);

  stockin.update({
    out: stockin.out,
    prodqtemv: stockin.prodqtemv - qte,
    },function (err, stockinID){
      if(err){
        console.log('GET Error: There was a problem retrieving: ' + err);

      }else{
        res.redirect("/listinout");
      }
    })

   });
   });

   router.get('/liststockout/:id', isAuthenticated, function(req, res){
    // var dt = new Date().toISOString();
     Depotinout.findById(req.params.id, function(err, stockin){
        if (err) {
          console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
          res.render('liststockout', {user: req.user, stockin:stockin});
        }
     });
   });

router.delete('/deletestockout', isAuthenticated, function(req, res){
    var stockinoutid = req.query.id;
    var outid = req.query.outid;
    var qteoutdel=req.query.outqte;

    Depotinout.findById(stockinoutid, function (err, stockin) {
    stockin.update({
      prodqtemv: Number(stockin.prodqtemv) + Number(qteoutdel),
    },function (err, providersID){
      if(err){
        console.log('GET Error: There was a problem retrieving: ' + err);

      }else{

            Depotinout.update({_id: stockinoutid}, {$pull: {out: {_id: outid}}} , function(err, stockin){
            if (err) {
              console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
              res.redirect("/listinout");
            }
        });
      }
    })

   });










});


 router.get('/adddepot', isAuthenticated, function(req, res){
   res.render('adddepot', {user: req.user});
 });

 router.post('/adddepot', isAuthenticated, function(req, res){

    var depot = new Depot();

    depot.depotname = req.body.depotname;
    depot.inout = [];

    depot.save(function(err) {
         if (err)
             res.send(err);

         res.redirect('/listdepots');
     });


 });



	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	return router;
}
/*******PROVIDERS************/
/* show listproviders */
router.get('/listproviders', isAuthenticated, function(req, res){

  Provider.find(function (err, provider){
  res.render('listproviders', { user: req.user, text: 'Tableau des consultations', prov: provider});
  });
});
/*show new provider*/
router.get('/addprovider', isAuthenticated, function(req, res){
	 	 res.render('addprovider', { user: req.user});
  });

/*POST add provider*/
router.post('/addprov', isAuthenticated, function(req, res){

      var provider = new Provider();
      provider.raisonsociale = req.body.raisonsociale;
      provider.telephone = req.body.telephone;
      provider.fax = req.body.fax;
      provider.mail = req.body.mail;
      provider.adresse = req.body.adresse;
      provider.site = req.body.site;
      provider.autre = req.body.autre;


      provider.save(function(err) {
          if (err)
              res.send(err);

          res.redirect('/listproviders');
      });
});

/* Get edit provider*/
  router.get('/editprovider/:id', isAuthenticated, function(req, res){
		Provider.findById(req.params.id, function(err, providers){

		 if (err) {
				 console.log('GET Error: There was a problem retrieving: ' + err);
		 } else {
		 res.render('editprovider', {
				user: req.user,
				providers: providers
		 });
		}

		});

	});


/*POST edit provider*/
router.post('/editprov/:id', isAuthenticated, function(req, res){
    Provider.findById(req.params.id, function (err, providers) {

    providers.update({
      raisonsociale: req.body.raisonsociale,
      telephone: req.body.telephone,
      fax: req.body.fax,
      mail: req.body.mail,
      adresse: req.body.adresse,
      site: req.body.site,
      autre: req.body.autre
    },function (err, providersID){
      if(err){
        console.log('GET Error: There was a problem retrieving: ' + err);

      }else{
        res.redirect("/listproviders");
      }
    })

   });
   });

/*Delete proviprovidersprovidersder*/
router.delete('/listproviders/:provider_id', isAuthenticated, function(req, res){

  Provider.remove({
    _id: req.params.provider_id
  }, function(err, provider) {
    if (err)
      res.send(err);

    res.json({ message: 'Provider successfully deleted!' });
  });
});
/*******DEPOTS************/
/*show listdepot*/
router.get('/listdepots', isAuthenticated, function(req, res){

  Depot.find(function (err, depots){
  res.render('listdepots', { user: req.user, text: 'Tableau des dépôts', depot: depots});
  });
});

/* Get edit depot*/
  router.get('/editdepot/:id', isAuthenticated, function(req, res){
		Depot.findById(req.params.id, function(err, depot){

		 if (err) {
				 console.log('GET Error: There was a problem retrieving: ' + err);
		 } else {
		 res.render('editdepot', {
				user: req.user,
				depot: depot
		 });
		}

		});

	});
/*POST edit depot*/
router.post('/editdepot/:id', isAuthenticated, function(req, res){
    Depot.findById(req.params.id, function (err, depot) {
      depot.update({
      depotname: req.body.depotname
    },function (err, depotID){
      if(err){
        console.log('GET Error: There was a problem retrieving: ' + err);

      }else{
        res.redirect("/listdepots");
      }
    })

   });
   });


   /*Delete depot*/
   router.delete('/listdepots/:depot_id', isAuthenticated, function(req, res){

     Depot.remove({
       _id: req.params.depot_id
     }, function(err, depot) {
       if (err)
         res.send(err);

       res.json({ message: 'Depot successfully deleted!' });
     });
   });
/* end DEPOT***************************************/

/*****PRODUCT*****************/
    /*get add prod*/
     router.get('/addprod', isAuthenticated, function(req, res){

       Product.find(function(err, prod){
         res.render('addprod', {user: req.user, prods: prod});
       });

     });



     /* Get edit prod*/
       router.get('/editprod/:id', isAuthenticated, function(req, res){
     		Product.findById(req.params.id, function(err, prod){

     		 if (err) {
     				 console.log('GET Error: There was a problem retrieving: ' + err);
     		 } else {
     		 res.render('editprod', {
     				user: req.user,
     				prod: prod
     		 });
     		}

     		});

     	});


   /*POST edit prod*/
   router.post('/editprod/:id', isAuthenticated, function(req, res){
       Product.findById(req.params.id, function (err, prod) {
         prod.update({
         prodcode: req.body.prodcode,
          prodname: req.body.prodname,
           extra: req.body.extra,
            qtemin: req.body.qtemin
       },function (err, prodID){
         if(err){
           console.log('GET Error: There was a problem retrieving: ' + err);
         }else{
           res.redirect("/listprod");
         }
       })

      });
      });

      router.get('/userlist', isAuthenticated, function(req, res){

        Users.find(function(err,users){
          res.render('userlist', {user: req.user, users: users});
        });


      });

      router.get('/listuser/:id', isAuthenticated, function(req, res){

        Users.findById(req.params.id, function(err, users){

          res.render('edituser', {user: req.user, users: users});
          //res.json(users);

        });

      });

      router.post('/listuser/:id', isAuthenticated, function(req, res){

        Users.findById(req.params.id, function (err, users) {
          users.update({
          username: req.body.username,
           firstName: req.body.firstName,
            lastName: req.body.lastName,
             email: req.body.email,
            password: createHash(req.body.password)
        },function (err, usersID){
          if(err){
            console.log('GET Error: There was a problem retrieving: ' + err);
          }else{
            res.redirect("/userlist");
          }
        })

        });

      });

      router.get('/adduser', isAuthenticated, function(req, res){

        res.render('adduser', {user: req.user});

      });


      router.post('/adduser', isAuthenticated, function(req, res){

        var users = new Users();
        users.firstName = req.body.firstName;
        users.lastName = req.body.lastName;
        users.email = req.body.email;
        users.password = createHash(req.body.password);
        users.username = req.body.username;

        users.save(function(err) {
            if (err)
                res.send(err);

            res.redirect('/userlist');
        });


      })

      router.delete('/deluser/:id', isAuthenticated, function(req, res){

        Users.remove({
          _id: req.params.id
        }, function(err, users) {
          if (err)
            res.send(err);

          res.json({ message: 'User successfully deleted!' });
        });

      });

      /*Delete prod*/
      router.delete('/listprod/:prod_id', isAuthenticated, function(req, res){

        Product.remove({
          _id: req.params.prod_id
        }, function(err, prod) {
          if (err)
            res.send(err);

          res.json({ message: 'Product successfully deleted!' });
        });
      });


      router.get('/gallery', isAuthenticated, function(req, res){
        res.render('productgallery', {user: req.user});
      });

      router.get('/stockinbk', isAuthenticated, function(req, res){

        var dt = new Date().toISOString();
        //s.split("").reverse().join("")
       Provider.find(function (err, provider){
        Product.find(function(err, prod){
          Depot.find(function(err, depot){
            res.render('stockinbk', {user: req.user, prods: prod, depots: depot, providers: provider,dt: dt.substring(0,10).split("-").reverse().join("/")});
          });
         });
       });

      });

      router.post('/stockinbk', isAuthenticated, function(req, res){
        var datesys = new Date();
         var tt = JSON.parse(req.body.obj);
         var to = [];

         for(i=0; i<tt.length; i++){
           var depotinout = new Depotinout();

           depotinout.depotname = req.body.depot;
           depotinout.prodid = tt[i].prodid.trim();
           depotinout.prodcode = tt[i].prodcode.trim();
           depotinout.prodname = tt[i].prodname.trim();
           depotinout.prodqteinit = Number(tt[i].prodqte);
           depotinout.prodqtemv = ConvertToUnit(Number(tt[i].prodqte), tt[i].produnite);
           depotinout.produnite = tt[i].produnite;
           depotinout.datein = (datesys.getDate() + '/' + (datesys.getMonth()+1) + '/' +  datesys.getFullYear() + ':' + datesys.getHours()+ 'h' + datesys.getMinutes() + 'mm');
           depotinout.dateexp = tt[i].prodexpdate;
           depotinout.dateachat = req.body.dateachat;
           depotinout.prixachat = tt[i].prixachat;
           depotinout.prixvente = tt[i].prixvente;
           depotinout.fournisseur = req.body.provider;
           depotinout.numbc = req.body.numbc;
           depotinout.numbl = req.body.numbl;
           depotinout.motifin = "ACHAT NORMAL";

           depotinout.save(function(err){
              if (err)
                  res.send(err);
          });
          }

        //  res.send(to);
        res.redirect('/listinout');
         /*depotinout.save(function(err){
            if (err)
                res.send(err);

            res.redirect('/listinout');
            //res.json("OK success");
        });*/

      });
