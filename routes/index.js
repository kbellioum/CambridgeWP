var express = require('express');
var router = express.Router();


var Patient = require('../models/patient');
var Events = require('../models/events');
var Counter = require('../models/counter');
var Prog = require('../models/prog');
var Product = require('../models/product');
var Depot = require('../models/depot');


var Getdate = function(d){
   var out = d.substring(0, 10).split("-",3);
   var dd = out[1] + "/" + out[2] + "/" + out[0]
   return dd;
}

var Gethour = function(h){
    var out = h.substring(11, 19);
    return out;
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
          var d = new Date();
          Patient.findById(req.query.id, function(err, patient){
            for (i=0; i< patient.visites.length; i++){
              if((patient.visites[i].clotured === false) && (patient.visites[i]._id.toString() === vid.toString())){
              total = total + patient.visites[i].prix;
              var factnum = patient.visites[i].factnum;
              var discount = patient.visites[i].discount;
              }
            }
          var totalr = (total - discount);

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
             date: d.getDate() + "/" + (Number(d.getMonth())+1).toString() + "/" + d.getFullYear()
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

		 if (err) {
				 console.log('GET Error: There was a problem retrieving: ' + err);
		 } else {
		 res.render('visite', {
				user: req.user,
				patients: patients,
		 });
		}

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
        var facturenum = inc ;
			  var visites = {
					poid: req.body.poid,
				  taille: req.body.taille,
				  prog: req.body.prog,
				  daterdv: new Date(),
				  prix: SetPrice(req.body.prog)[0],
          descprod: SetPrice(req.body.prog)[1],
					comment: req.body.comment,
					consultant: req.user.lastName + " " + req.user.firstName,
          clotured: false,
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


      }
    })

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

		    patient.save(function(err) {
		        if (err)
		            res.send(err);

						res.redirect('/listpat');
		    });
  });

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

		Patient.findById(req.params.id, function (err, patients) {

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
				statu: statu
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


 router.get('/addprod', isAuthenticated, function(req, res){

   Product.find(function(err, prod){
     res.render('addprod', {user: req.user, prods: prod});
   });

 });

 router.get('/editprog', isAuthenticated, function(req, res){

   Prog.find(function (err, prog){
   //res.render('tabcons', { user: req.user, text: 'Tableau des consultations', patient: patient});
   res.render('editprog', {user: req.user, progs: prog});
   });

   //res.render('editprog', {user: req.user});
 });

 router.post('/updateprogdetail', isAuthenticated, function(req, res){

   var obj = JSON.parse(req.body.obj);
   var progone = req.body.progname.toString();

   Prog.findOne({progname: progone}, function(err, prog){
     for(i=0; i < obj.length; i++){
       prog.products.push(obj[i]);
     }


     //console.log(obj);
     //console.log(progone);

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
       prog.maxunite = req.body.maxunite;

       console.log(prog);

       prog.save(function(err) {
           if (err)
               res.send(err);

           res.redirect('/addprog');
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

           res.redirect('/home');
       });

 });

 router.get('/listprod', isAuthenticated, function(req, res){
   Product.find(function (err, prod){
     res.render('listprod', {user: req.user, prods: prod});
   });

 });

 router.get('/stockin', isAuthenticated, function(req, res){
   var dt = new Date().toISOString();
   //s.split("").reverse().join("")
   Product.find(function(err, prod){
     Depot.find(function(err, depot){
       res.render('stockin', {user: req.user, prods: prod, depots: depot,dt: dt.substring(0,10).split("-").reverse().join("/")});
     });

   });

 });


 router.post('/stockin', isAuthenticated, function(req, res){

   var prodinfo = req.body.prodinfo;
   var prodqte = req.body.prodqte;
   var produnite = req.body.produnite;
   var proddatein = req.body.datein;
   var proddateexp = req.body.dateexp;
   var proddepot = req.body.depot;
   var dateachat = req.body.dateachat;
   var prixachat = req.body.prixachat;
   var prixvente = req.body.prixvente;
   var fournisseur = req.body.fournisseur;
   var numbc = req.body.numbc;
   var numbl = req.body.numbl;




   var prodcode = prodinfo.substring(0,9);

   Product.findOne({prodcode: prodcode}, function(err, prod){

     var prodid = prod._id;

     var obj = {
       prodid: prodid,
       prodcode: prodcode,
       prodqteinit: prodqte,
       prodqtemv: ConvertToUnit(prodqte,produnite),       // 1 x Caisse = 6 x Boîtes ; 1 x Boîte = 21 x unités
       produnite: produnite,                              // 1 x Caisse = 6 x 21 unités
       datein: proddatein,
       dateexp: proddateexp,
       depot: proddepot,
       dateachat: dateachat,
       prixachat: prixachat,
       prixvente: prixvente,
       Fournisseur: fournisseur,
       numbc: numbc,
       numbl: numbl
     };

     Depot.findOne({depotname: proddepot}, function(err, depot){

       depot.inout.push(obj);

       depot.update({
         inout: depot.inout
       }, function (err, depotID){
         if(err){
           console.log('GET Error: There was a problem retrieving: ' + err);
           res.redirect('/home');
         }else{
           res.redirect("/home");
         }
       })

     });


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

         res.redirect('/home');
     });


 });

router.get('/listinout', isAuthenticated, function(req, res){

  Depot.find(function(err, depot){

    res.render('listinout', {user: req.user, depots: depot});

  });

});


	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}
