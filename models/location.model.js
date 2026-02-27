import mongoose from "mongoose";

const subCitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false }); // optional: no separate _id for each subCity

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subCities: [String] // array of strings
}, { _id: false });

const locationSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  cities: [citySchema] // array of city subdocuments
}, { timestamps: true });

export default mongoose.model("Location", locationSchema);