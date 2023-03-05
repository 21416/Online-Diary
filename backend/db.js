const mongoose=require('mongoose')
const monoURI="mongodb://127.0.0.1:27017/inotebook";
const connectTOmongo=()=>{
    mongoose.connect(monoURI,()=>{
        console.log("Connected To mongo");
    })
}
mongoose.set('strictQuery', true);
module.exports=connectTOmongo;