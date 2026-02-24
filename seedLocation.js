import mongoose from "mongoose";
import Location from "./models/location.model.js";

await mongoose.connect("mongodb://localhost:27017/nit_backend");

await Location.deleteMany(); // clear old data

await Location.insertMany([
  // ANDHRA PRADESH
  {
    state: "Andhra Pradesh",
    cities: [
      { name: "Visakhapatnam", subCities: ["MVP Colony", "Gajuwaka", "Dwaraka Nagar"] },
      { name: "Vijayawada", subCities: ["MG Road", "Benz Circle", "Auto Nagar"] },
      { name: "Guntur", subCities: ["Arundelpet", "Brodipet"] },
      { name: "Tirupati", subCities: ["Tiruchanur", "Alipiri"] }
    ]
  },
  // ARUNACHAL PRADESH
  {
    state: "Arunachal Pradesh",
    cities: [
      { name: "Itanagar", subCities: ["Naharlagun", "Banderdewa"] },
      { name: "Tawang", subCities: ["Tawang City Center"] }
    ]
  },
  // ASSAM
  {
    state: "Assam",
    cities: [
      { name: "Guwahati", subCities: ["Beltola", "Pan Bazaar", "Paltan Bazaar"] },
      { name: "Dibrugarh", subCities: ["Bokakhat", "Nazira Road"] }
    ]
  },
  // BIHAR
  {
    state: "Bihar",
    cities: [
      { name: "Patna", subCities: ["Kankarbagh", "Rajendra Nagar", "Boring Road"] },
      { name: "Gaya", subCities: ["Vishnupad", "Udantpuri"] }
    ]
  },
  // CHHATTISGARH
  {
    state: "Chhattisgarh",
    cities: [
      { name: "Raipur", subCities: ["Telibandha", "Shankar Nagar", "Lakshmi Nagar"] },
      { name: "Bilaspur", subCities: ["Ratanpur", "Koni"] }
    ]
  },
  // GOA
  {
    state: "Goa",
    cities: [
      { name: "Panaji", subCities: ["Fontainhas", "Miramar"] },
      { name: "Margao", subCities: ["Borda", "Mandel"] }
    ]
  },
  // GUJARAT
  {
    state: "Gujarat",
    cities: [
      { name: "Ahmedabad", subCities: ["Navrangpura", "Satellite", "Maninagar"] },
      { name: "Surat", subCities: ["Udhna", "Varachha"] },
      { name: "Vadodara", subCities: ["Alkapuri", "Manjalpur"] }
    ]
  },
  // HARYANA
  {
    state: "Haryana",
    cities: [
      { name: "Gurugram", subCities: ["Sector 14", "DLF Phase 1", "Sohna Road"] },
      { name: "Faridabad", subCities: ["Sector 15", "Old Faridabad"] }
    ]
  },
  // HIMACHAL PRADESH
  {
    state: "Himachal Pradesh",
    cities: [
      { name: "Shimla", subCities: ["The Mall", "Chaura Maidan"] },
      { name: "Dharamshala", subCities: ["McLeod Ganj", "Naddi"] }
    ]
  },
  // JHARKHAND
  {
    state: "Jharkhand",
    cities: [
      { name: "Ranchi", subCities: ["Hatia", "Argora"] },
      { name: "Jamshedpur", subCities: ["Bistupur", "Sakchi"] }
    ]
  },
  // KARNATAKA
  {
    state: "Karnataka",
    cities: [
      { name: "Bengaluru", subCities: ["Whitefield", "Koramangala", "Indiranagar"] },
      { name: "Mysuru", subCities: ["Hebbal", "Vijayanagar"] },
      { name: "Mangalore", subCities: ["Bolar", "Kadri"] }
    ]
  },
  // KERALA
  {
    state: "Kerala",
    cities: [
      { name: "Kochi", subCities: ["Fort Kochi", "Edappally", "Marine Drive"] },
      { name: "Thiruvananthapuram", subCities: ["Kazhakkoottam", "Vazhuthacaud"] }
    ]
  },
  // MADHYA PRADESH
  {
    state: "Madhya Pradesh",
    cities: [
      { name: "Bhopal", subCities: ["Indrapuri", "Arera Colony"] },
      { name: "Indore", subCities: ["Navlakha", "Palasia"] }
    ]
  },
  // MAHARASHTRA
  {
    state: "Maharashtra",
    cities: [
      { name: "Mumbai", subCities: ["Andheri", "Bandra", "Dadar","kurla"] },
      { name: "Pune", subCities: ["Hinjewadi", "Koregaon Park"] },
      { name: "Nagpur", subCities: ["Sitabuldi", "Civil Lines"] },
      { name: "Nashik", subCities: ["Mahatma Nagar", "College Road"] }
    ]
  },
  // MANIPUR
  {
    state: "Manipur",
    cities: [
      { name: "Imphal", subCities: ["Keirao", "Lamka"] }
    ]
  },
  // MEGHALAYA
  {
    state: "Meghalaya",
    cities: [
      { name: "Shillong", subCities: ["Police Bazaar", "Laitumkhrah"] }
    ]
  },
  // MIZORAM
  {
    state: "Mizoram",
    cities: [
      { name: "Aizawl", subCities: ["Zonuam", "Chhinga Veng"] }
    ]
  },
  // NAGALAND
  {
    state: "Nagaland",
    cities: [
      { name: "Kohima", subCities: ["Lower Chandmari", "New Minister Hill"] },
      { name: "Dimapur", subCities: ["Seithekema", "Pattoki"] }
    ]
  },
  // ODISHA
  {
    state: "Odisha",
    cities: [
      { name: "Bhubaneswar", subCities: ["Kharavela Nagar", "Saheed Nagar"] },
      { name: "Cuttack", subCities: ["Choudhury Bazar", "Badambadi"] }
    ]
  },
  // PUNJAB
  {
    state: "Punjab",
    cities: [
      { name: "Ludhiana", subCities: ["Ferozepur Road", "Saraba"] },
      { name: "Amritsar", subCities: ["Wagah Road", "Ranjit Avenue"] }
    ]
  },
  // RAJASTHAN
  {
    state: "Rajasthan",
    cities: [
      { name: "Jaipur", subCities: ["Malviya Nagar", "Vaishali Nagar"] },
      { name: "Udaipur", subCities: ["Hiran Magri", "Bapu Bazar"] }
    ]
  },
  // SIKKIM
  {
    state: "Sikkim",
    cities: [
      { name: "Gangtok", subCities: ["Deorali", "Tadong"] }
    ]
  },
  // TAMIL NADU
  {
    state: "Tamil Nadu",
    cities: [
      { name: "Chennai", subCities: ["T. Nagar", "Adyar", "Velachery"] },
      { name: "Coimbatore", subCities: ["RS Puram", "Peelamedu"] },
      { name: "Madurai", subCities: ["Vilangudi", "Thiruparankundram"] }
    ]
  },
  // TELANGANA
  {
    state: "Telangana",
    cities: [
      { name: "Hyderabad", subCities: ["Banjara Hills", "Gachibowli"] },
      { name: "Warangal", subCities: ["Hanmakonda", "Narsampet"] }
    ]
  },
  // TRIPURA
  {
    state: "Tripura",
    cities: [
      { name: "Agartala", subCities: ["Krishnanagar", "City Center"] }
    ]
  },
  // UTTAR PRADESH
  {
    state: "Uttar Pradesh",
    cities: [
      { name: "Lucknow", subCities: ["Gomti Nagar", "Hazratganj"] },
      { name: "Kanpur", subCities: ["Swaroop Nagar", "Saket Nagar"] },
      { name: "Noida", subCities: ["Sector 18", "Sector 62"] },
      { name: "Varanasi", subCities: ["Godowlia", "Rathyatra"] }
    ]
  },
  // UTTARAKHAND
  {
    state: "Uttarakhand",
    cities: [
      { name: "Dehradun", subCities: ["Rajpur Road", "Ballupur"] },
      { name: "Haridwar", subCities: ["Mansa Devi Road", "BHEL"] }
    ]
  },
  // WEST BENGAL
  {
    state: "West Bengal",
    cities: [
      { name: "Kolkata", subCities: ["Park Street", "Salt Lake"] },
      { name: "Howrah", subCities: ["Shalimar", "Bally"] },
      { name: "Durgapur", subCities: ["City Centre", "Bindu Chowdhuri"] }
    ]
  }
]);

console.log("All states, cities, and sub‑cities inserted successfully!");
process.exit();