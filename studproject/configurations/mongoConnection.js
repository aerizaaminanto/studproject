import mongoose from "mongoose";
import { setServers } from "node:dns/promises";
setServers(["1.1.1.1", "8.8.8.8"]);

mongoose.connect('mongodb+srv://aerizaaminanto_db_user:belajarkada@studatlas.slrts4d.mongodb.net/studproject')
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));
export default mongoose;