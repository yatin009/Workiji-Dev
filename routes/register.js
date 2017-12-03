/**
 * Created by yatin on 15/10/17.
 */
let express = require('express');
let router = express.Router();
const admin = require('firebase-admin');
let Organization = require('../models/organization.js');
let Contractor = require('../models/contractor.js');
let User = require('../models/user.js');
let ContractorUser = require('../models/contractorUser.js');
let FirebaseUser = require('../models/firebaseUser.js');
let Company = require('../models/company.js');
let HELPER = require('../helper/helperFunctions.js');

const database = admin.database();

router.post('/organization', function (req, res) {
    var org = req.body;
    HELPER.createOrganizationCode(new Organization(org), res);
});

router.post('/contractor', function (req, res) {
    var con = req.body;
    console.log(con);
    registerContractorInFirebase(con, res);
});

function registerContractorInFirebase(contractor, res){
    admin.auth().createUser({
        email: contractor.email,
        emailVerified: true,
        phoneNumber: contractor.contactNumber,
        password: contractor.password,
        displayName: contractor.name,
        disabled: false
    }).then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully created new user:", userRecord.uid);
        createContractorInFirebase(userRecord, contractor, res);
    })
        .catch(function(error) {
            console.log("Error creating new user:", error);
            res.status(500);
            res.send("Error creating Contractor in firebase authentication");
        });
}

function createContractorInFirebase(userRecord, contractor, res){
    var contractorUser = new Contractor(contractor, userRecord);
    admin.database().ref("contractors/" + contractorUser.uniqueId).set(
        contractorUser
    );

    var user = new ContractorUser(contractorUser, contractor);
    admin.database().ref("users/" + contractorUser.uniqueId).set(
        user
    );
    res.status(200);
    res.send("Contractor Created");
}

router.post('/user', function (req, res) {
    var usr = req.body;
    registerUserInFirebase(usr, res);
});

function registerUserInFirebase(usr, res){
    admin.auth().createUser({
        email: usr.emailId,
        emailVerified: true,
        phoneNumber: usr.contactNumber,
        password: usr.password,
        displayName: usr.name,
        disabled: false
    }).then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully created new user:", userRecord.uid);
        if(usr.role === "company"){
            createCompanyInFirebase(userRecord, usr, res);
        }else{
            createUserInFirebase(userRecord, usr, res);
        }
    })
        .catch(function(error) {
            console.log("Error creating new user:", error);
            res.status(500);
            res.send("Error creating Contractor in firebase authentication");
        });user
}

function createCompanyInFirebase(userRecord, usr, res){
    var company = new Company(usr, userRecord);
    admin.database().ref("company/" + company.uniqueId).set(
        company
    );
    createUserInFirebase(userRecord, usr, res);
}

function createUserInFirebase(userRecord, usr, res){
    var user = new FirebaseUser(usr, userRecord);
    admin.database().ref("users/" + user.uniqueId).set(
        user
    );
    res.status(200);
    res.send("User Created");
}

module.exports = router;