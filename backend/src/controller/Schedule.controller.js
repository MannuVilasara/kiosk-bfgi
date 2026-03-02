import Schedule from "../models/Schedule.model.js";
import cloudinary from '../config/Cloudinary.js';


export const addSchedule=async(req,res)=>{
    try{
        const {departmentName,semester,sectionName,scheduleLink}=req.body;

        const cloudinaryRes=await cloudinary.uploader.upload(scheduleLink, {
            resource_type: 'raw',
            folder: 'schedules',
        })
        const schedule=new Schedule({
            departmentName,
            semester,
            sectionName,
            scheduleLink:cloudinaryRes.secure_url
        })
        await schedule.save()
        res.status(201).json(schedule)
    }catch(err){
        res.status(500).json({message:err.message}) 
        console.log(err)
    }
}

export const getScheduleById=async(req,res)=>{
    try{
        const {id}=req.params;
        const schedule=await Schedule.findById(id)
        res.status(200).json(schedule)
    }catch(err){
        res.status(500).json({message:err.message}) 
        console.log(err)
    }
}

export const getAllSchedules=async(req,res)=>{
    try{
        const schedules=await Schedule.find()
        res.status(200).json(schedules)
    }catch(err){
        res.status(500).json({message:err.message}) 
        console.log(err)
    }
}

export const updateSchedule=async(req,res)=>{
    try{
        const { id: scheduleId }=req.params;
        const {departmentName,semester,sectionName}=req.body;
        let { scheduleLink }=req.body;

        if(scheduleLink){
            const cloudinaryRes=await cloudinary.uploader.upload(scheduleLink, {
                resource_type: 'raw',
                folder: 'schedules',
            })
            scheduleLink=cloudinaryRes.secure_url;
        }

        const updatedSchedule=await Schedule.findByIdAndUpdate(scheduleId,{
            departmentName,
            semester,
            sectionName,
            scheduleLink
        },{new:true})
        res.status(200).json(updatedSchedule)
    }catch(err){
        res.status(500).json({message:err.message}) 
        console.log(err)
    }
}


export const deleteSchedule=async(req,res)=>{
            try{
                const {id}=req.params;
                const deletedSchedule=await Schedule.findByIdAndDelete(id)
                res.status(200).json(deletedSchedule)
            }catch(err){
                res.status(500).json({message:err.message}) 
                console.log(err)
            }
}