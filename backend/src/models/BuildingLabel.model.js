import mongoose from 'mongoose';

const buildingLabelSchema = new mongoose.Schema(
  {
    kioskId: { type: String, default: 'default', index: true },
    id:      { type: String, required: true },   // e.g. "block_a"
    name:    { type: String, required: true },   // display name shown on map
    sub:     { type: String, default: '' },      // optional sub-line
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
  },
  { timestamps: true }
);

buildingLabelSchema.index({ kioskId: 1, id: 1 }, { unique: true });

const BuildingLabel = mongoose.model('BuildingLabel', buildingLabelSchema);
export default BuildingLabel;
