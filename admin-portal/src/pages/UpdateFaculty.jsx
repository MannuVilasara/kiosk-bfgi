import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/Instance';
import {
  Save,
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Activity,
  Upload,
  User as UserIcon,
  X,
  Camera,
  CheckCircle2,
  Building2,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/ui';

const UpdateFaculty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    facultyName: '',
    designation: '',
    qualification: '',
    totalExperience: '',
    imageUrl: '',
    email: '',
    phoneNumber: '',
    department: 'CSE',
  });

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axiosInstance.get(`/api/faculty/${id}`);
        const f = res.data.faculty || res.data;
        setFormData({
          facultyName: f.facultyName || '',
          designation: f.designation || '',
          qualification: f.qualification || '',
          totalExperience: f.totalExperience || '',
          imageUrl: f.imageUrl || '',
          email: f.email || '',
          phoneNumber: f.phoneNumber || '',
          department: f.department || 'CSE',
        });
      } catch (err) {
        console.error('Error fetching faculty:', err);
        toast.error('Failed to load faculty details.');
        navigate('/faculty');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image exceeds 2MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.facultyName || !formData.email) {
      toast.error('Name and Email are required.');
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.put(`/api/faculty/update/${id}`, formData);
      toast.success('Faculty updated successfully!');
      navigate('/faculty');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update faculty.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader message="Loading Faculty..." />;

  return (
    <div className="lg:ml-64 mt-20 h-[calc(100vh-5rem)] flex flex-col font-sans bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="px-6 sm:px-10 py-5 flex justify-between items-center shrink-0 border-b border-slate-200 bg-white shadow-sm z-10">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate('/faculty')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Edit Faculty</h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {formData.facultyName || 'Faculty Member'} · {formData.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/faculty')}
            className="px-4 py-2 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Profile Photo + Name Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Camera size={14} className="text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile & Identity</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Photo */}
                  <div className="shrink-0">
                    {!formData.imageUrl ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-28 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isDragging
                            ? 'bg-blue-50 border-blue-400 scale-105'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                      >
                        <Upload size={20} className={isDragging ? 'text-blue-400' : 'text-slate-300'} />
                        <span className="text-[9px] font-bold text-slate-400 mt-1">Upload</span>
                      </div>
                    ) : (
                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                        <img
                          src={formData.imageUrl}
                          alt="Faculty"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=?'; }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-white rounded-md text-slate-600 hover:bg-slate-100"><Upload size={14} /></button>
                          <button type="button" onClick={removeImage} className="p-1.5 bg-white rounded-md text-red-500 hover:bg-red-50"><X size={14} /></button>
                        </div>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>

                  {/* Name + Designation */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField icon={UserIcon} label="Full Name" name="facultyName" value={formData.facultyName} onChange={handleInputChange} placeholder="Dr. John Doe" required />
                    <InputField icon={Briefcase} label="Designation" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Professor" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Details</h3>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField icon={GraduationCap} label="Qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="Ph.D in Computer Science" required />
                <InputField icon={Activity} label="Experience (Years)" name="totalExperience" type="number" value={formData.totalExperience} onChange={handleInputChange} placeholder="10" required />
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Information</h3>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField icon={Mail} label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@campus.edu" required />
                <InputField icon={Phone} label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+91 98765 43210" required />
              </div>
            </div>

            {/* Department */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setFormData({ ...formData, department: dept })}
                      className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 ${
                        formData.department === dept
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      {formData.department === dept && <CheckCircle2 size={14} />}
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

/* ── Inline Input Component ──────────────────────────────────────────────── */
const InputField = ({ icon: Icon, label, name, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all shadow-sm"
      />
    </div>
  </div>
);

export default UpdateFaculty;