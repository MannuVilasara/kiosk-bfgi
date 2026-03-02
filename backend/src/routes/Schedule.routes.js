import express from 'express'
import { addSchedule, deleteSchedule, getAllSchedules, getScheduleById, updateSchedule } from '../controller/Schedule.controller.js'
import { auth } from '../middlewares/auth.middleware.js';


const router=express.Router()



router.post('/add',auth,addSchedule)
router.get('/all',getAllSchedules)
router.get('/:id',getScheduleById)
router.delete('/delete/:id',auth,deleteSchedule)
router.put('/update/:id',auth,updateSchedule)


export default router;