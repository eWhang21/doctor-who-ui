"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");
        // already implemented:
        Doctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        console.log('req.body', req.body);
        if (!req.body.name || !req.body.seasons) {
            res.status(500).send({message: 'name and seasons required'})
            return;
        }
        Doctor.create(req.body)
        .save()
        .then(doctor => {
            res.status(201).send(doctor);
        })
        .catch(err => {
            res.status(500).send(err);
        })
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
        .then(doctor =>{
            if (!doctor)
            {
                res.status(404).send({message: "Please enter valid ID"})
            }  
                res.status(200).send(doctor)
        })
        .catch(error =>{
            res.status(404).send({message: "Please enter valid ID", error: error})
        });
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        // res.status(501).send();
        console.log("req.body", req.body)
        Doctor.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        )
            .then(doctor => {
                console.log("doctor", doctor)
                res.status(200).send(doctor);
            })
            .catch(err => {
                res.status(404).send({
                    message: 'Please enter a valid ID',
                    error: err
                })
            })


    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        // res.status(501).send();
        Doctor.findOneAndDelete(
            {_id: req.params.id }
        )
        .then(data => {
            if (data) {
                res.status(200).send(null)
            }
            else {
                res.status(400).send({
                    message: 'Please enter a valid ID'
                })
            }
        })
        .catch(err => {
            res.status(404).send({
                message: 'Artist with id "${req.params.id}" does not exist',
                error: err
            })
        })
    });
    
router.route("/doctors/:id/companions")
    // #3
    // list of companions that travelled with the doctor
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        // res.status(501).send();
        // use the ID to
        console.log(req.params.id)
        Companion.find({ 'doctors': { '$eq': req.params.id } })
            .then(companions => {
                if (!companions) {
                    res.status(404).send({ message: "please enter a valid ID" })
                }
                else {
                    res.status(200).send(companions);
                }
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });
    
router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        Companion.find({ 'doctors': { '$eq': req.params.id } })
            .then(companions => {
                if (!companions) {
                    res.status(404).send({ message: "please enter a valid ID" })
                }
                else {
                    console.log("comapnions", companions)
                    const alive_array = []
                    for (var i = 0; i < companions.length; i++){
                        if (companions[i].alive == false){
                            res.status(200).send("false");
                            return;
                        }
                    }
                    res.status(200).send("true");
                }
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });
        /*
        Doctor.find(req.params.id)
            .then(doctor => {
                if (!doctor) {
                    res.status(404).send({ message: "please enter a valid ID" })
                }
                else {
                    doctor.
                    Companion.find({ 'doctors': { '$eq': req.params.id } })
                    .then(companions => {
                        if (!companions) {
                            res.status(404).send({ message: "please enter a valid ID" })
                        }
                        else {
                            res.status(200).send(companions);
                        }
                    })
                }
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });
*/

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        // res.status(501).send();
        if (!req.body.name || !req.body.character || !req.body.doctors || !req.body.seasons || !req.body.alive) {
            res.status(500).send({message: 'name, character, doctors, seasons, alive status required'})
            return;
        }
        Companion.create(req.body)
        .save()
        .then(doctor => {
            res.status(201).send(doctor);
        })
        .catch(err => {
            res.status(500).send(err);
        })
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        // list of the companions who travelled with multiple doctors
        Companion.find( {  $nor: [{ doctors: { $size: 0 }}, { doctors: { $size: 1 }} ] })
        .then(doctor => {
            if (!doctor){
                res.status(404).send({message: "Please enter valid ID"});
            }
            else{
                res.status(200).send(doctor);
            }
        })
        .catch(err => {
            res.status(404).send(err);
        });
    });
// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
        .then(companion =>{
            if (!companion)
            {
                res.status(404).send({message: "Please enter valid ID"})
            }  
                res.status(200).send(companion)
        })
        .catch(error =>{
            res.status(404).send({message: "Please enter valid ID", error: error})
        });
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        )
            .then(doctor => {
                res.status(200).send(doctor);
            })
            .catch(err => {
                res.status(404).send({
                    message: 'Please enter a valid ID',
                    error: err
                })
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        // res.status(501).send();
        Companion.findOneAndDelete(
            {_id: req.params.id }
        )
        .then(data => {
            if (data) {
                res.status(200).send(null)
            }
            else {
                res.status(400).send({
                    message: 'Please enter a valid ID'
                })
            }
        })
        .catch(err => {
            res.status(404).send({
                message: 'Please enter a valid ID',
                error: err
            })
        })
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        // list of the Doctors with whom this companion travelled

        //noot!! 
            // list of the companions that travelled with
            // the doctor with the specified id
        // search for the correct companion w right ID
        Companion.findById(req.params.id)
        .then(companion => {
            // check for validity, return error if not valid
            if (!companion){
                res.status(404).send({message: "Please enter valid ID"});
            }
            else{
                // search for all the doctors listed in the "doctors" field
                //console.log("doctors of companiosn", Doctor.find({_id: {"$eq": _id}}))
                Doctor.find({ $and: [{_id: {$ne: req.params.id} },
                    {_id: {$in: companion.doctors}}]
                    })
                .then(friends => {
                    res.status(200).send(friends);

                })
            }
        })
        .catch(err => {
            res.status(404).send(err);
        });
    });


router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        // list of the companions who appeared on at least one
        // of the same seasons as this companion
        Companion.findById(req.params.id)
            .then(companion => {
                if (!companion){
                    res.status(404).send({message: "Please enter a valid ID"});
                }
                else{
                    Companion.find({ $and: [{_id: {$ne: req.params.id} },
                                            {seasons: {$in: companion.seasons}}]
                                    })
                             .then(friends => {
                                res.status(200).send(friends);

                            })
                        }
                })
            .catch(err => {
                res.status(404).send({
                    message: "Please enter valid ID",
                    error: err
                })
            })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;