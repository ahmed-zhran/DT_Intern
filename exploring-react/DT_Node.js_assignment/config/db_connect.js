const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority`;
const DB = new MongoClient(uri, JSON.parse(process.env.DB_PARAMS));

const connectDB = async () => {
    try{
        const conn = await DB.connect();
        conn
            .withSession(() => console.info("connected to db".cyan.bold))
    }catch(e){
        console.error(`ERROR on db connection : ${e}`.red.bold);
    }
}


module.exports = { connectDB, DB };