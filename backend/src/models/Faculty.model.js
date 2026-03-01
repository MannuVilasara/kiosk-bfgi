import mongoose from 'mongoose';

const TranslatedFieldSchema = new mongoose.Schema(
  {
    facultyName: { type: String, default: '' },
    designation: { type: String, default: '' },
    qualification: { type: String, default: '' },
  },
  { _id: false }
);

const FacultySchema = new mongoose.Schema({
  facultyName: {
    type: String,
  },
  designation: {
    type: String,
  },
  qualification: {
    type: String,
  },
  totalExperience: {
    type: Number,
  },
  imageUrl: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  department: {
    type: String,
    enum: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'],
  },
  translations: {
    type: Map,
    of: TranslatedFieldSchema,
    default: {},
  },
});

const Faculty = mongoose.model('faculty', FacultySchema);
export default Faculty;
