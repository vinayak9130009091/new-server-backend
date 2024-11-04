

const mongoose = require('mongoose');


// Define the form element schema
const organizerSectionSchemaformElementSchema = new mongoose.Schema({
    type: { type: String, required: true },
    id: { type: Number, required: true },
    sectionid: { type: Number, required: true },
    options: [
        {
            id: { type: Number, required: true },
            text: { type: String, required: true },
            selected: {type: Boolean}
        }
    ],
    text: { type: String },
    textvalue: { type: String }

});



const organizerSectionSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String },
    text: { type: String },
    formElements: [organizerSectionSchemaformElementSchema],
});



const organizerAccountWiseSchema = new mongoose.Schema({

    accountid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
    },

    organizertemplateid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizerTemplate',
    },

    reminders : {
        type: Boolean,
    },

    noofreminders:  {
        type: String,
    },
    daysuntilnextreminder: {
        type: String,
    },
    
    jobid : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    }],

    sections: [organizerSectionSchema],

    active: {
        type: Boolean,
        default: true
    },

    issealed:{
        type: Boolean,
        default: false
    },

}, { timestamps: true });


const OrganizerAccountWise = mongoose.model('OrganizerAccountWise', organizerAccountWiseSchema);
module.exports = OrganizerAccountWise;
