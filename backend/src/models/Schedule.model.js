import mongoose from 'mongoose';

const scheduleSchema=new mongoose.Schema({
    departmentName:{
        type:String,
        required:true,
        enum:['CSE','ECE','MECH','CIVIL','AIML','IoT']
    },
    semester:{
        type:Number
    },
    sectionName:{
        type:String,
        enum:['A','B','C','D']
    },
    scheduleLink:{
        type:String
    }
},{timestamps:true})


const Schedule=mongoose.model('Schedule',scheduleSchema)
export default Schedule;