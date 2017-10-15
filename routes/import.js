/**
 * Created by yatin on 15/10/17.
 */
var express = require('express');
var router = express.Router();
const admin = require('firebase-admin');

const Building = require('../models/building.js');
const BuildingUser = require('../models/buildingUser.js');

const database = admin.database();

router.post('/building', function (req, res) {
    var jsonData = req.body;
    var buildingUsers = [];
    var building = new Building(jsonData.building, jsonData.agentId);
    for (var i = 0; i < jsonData.buildings_users.length; i++) {
        buildingUsers.push(new BuildingUser(jsonData.buildings_users[i], building));
    }
    insertBuildingObject(building, buildingUsers, res);
});

function insertBuildingObject(building, buildingUsers, res) {
    const newPostKey = database.ref("buildings").push().key;
    building.buildingObjectKey = newPostKey;
    admin.database().ref("buildings/" + newPostKey).set(
        building
    );

    insertBuildingUsers(building, buildingUsers, res);
}

function insertBuildingUsers(building, buildingUsers, res){
    for (i = 0; i < buildingUsers.length; i++) {
        var buildingUser = buildingUsers[i];
        const newPostKey = database.ref("building_users").push().key;
        buildingUser.buildingId = building.buildingObjectKey;
        buildingUser.uniqueId = newPostKey;
        admin.database().ref("building_users/" + buildingUser.uniqueId).set(
            buildingUser
        );
    }
    res.status(200);
    res.send("Building and Building users added");
}

module.exports = router;