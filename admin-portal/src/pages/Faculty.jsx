import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/Instance';
import {
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Building2,
  Upload,
  User as UserIcon,
  Activity,
  X,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLoader, Card, FormInput, Button, SearchInput } from '../components/ui';
import { authContext } from '../context/AuthContext';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isDragging, setIsDragging] = useState(false);

  const { user } = useContext(authContext);
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

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

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/faculty/all');
      setFaculty(res.data.faculties || res.data || []);
    } catch (err) {
      console.error('Faculty Sync Error:', err);
      toast.error('Unable to sync faculty directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error('Faculty profile requires an image.');
      return;
    }
    setActionLoading(true);
    try {
      await axiosInstance.post('/api/faculty/add', formData);
      setFormData({
        facultyName: '',
        designation: '',
        qualification: '',
        totalExperience: '',
        imageUrl: '',
        email: '',
        phoneNumber: '',
        department: 'CSE',
      });
      toast.success('Faculty added successfully!');
      fetchFaculty();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add faculty.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return;
    setActionLoading(true);
    try {
      await axiosInstance.get(`/api/faculty/delete/${id}`);
      toast.success('Faculty deleted!');
      fetchFaculty();
    } catch (err) {
      toast.error('Failed to delete faculty.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchesSearch =
        f.facultyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'All' || f.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [faculty, searchQuery, selectedDept]);

  if (loading) return <PageLoader message="Loading Faculty..." />;

  return (
    <div className="lg:ml-64 mt-20 min-h-[calc(100vh-5rem)] p-4 sm:p-8">
      <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Add Faculty Form */}
        {isAdmin && <Card
          headerIcon={Camera}
          headerTitle="Add Faculty"
          headerSubtitle="Register new member"
          className="h-fit"
        >
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Profile Photo
              </label>
              {!formData.imageUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isDragging
                      ? 'bg-blue-50 border-blue-400 scale-[1.01]'
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-400'
                  }`}
                >
                  <Upload className={`mb-2 ${isDragging ? 'text-blue-400' : 'text-slate-300'}`} size={24} />
                  {isDragging ? (
                    <p className="text-xs font-bold text-blue-400">Drop to upload</p>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-slate-400">Drag & drop or click to upload</p>
                      <p className="text-[10px] text-slate-300 mt-0.5">PNG, JPG up to 2MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 group">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2 bg-white text-red-500 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <FormInput
              label="Faculty Name"
              name="facultyName"
              icon={UserIcon}
              value={formData.facultyName}
              onChange={handleInputChange}
              placeholder="Dr. John Doe"
              size="small"
              required
            />
            <FormInput
              label="Designation"
              name="designation"
              icon={Briefcase}
              value={formData.designation}
              onChange={handleInputChange}
              placeholder="Professor"
              size="small"
              required
            />
            <FormInput
              label="Qualification"
              name="qualification"
              icon={GraduationCap}
              value={formData.qualification}
              onChange={handleInputChange}
              placeholder="Ph.D"
              size="small"
              required
            />
            <FormInput
              label="Experience (Years)"
              name="totalExperience"
              type="number"
              icon={Activity}
              value={formData.totalExperience}
              onChange={handleInputChange}
              placeholder="10"
              size="small"
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@campus.edu"
              size="small"
              required
            />
            <FormInput
              label="Phone"
              name="phoneNumber"
              icon={Phone}
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+91 98765 43210"
              size="small"
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Department
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setFormData({ ...formData, department: dept })}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${formData.department === dept ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" loading={actionLoading} icon={UserPlus} fullWidth>
              Add Faculty
            </Button>
          </form>
        </Card>}

        {/* Faculty List */}
        <Card
          className={isAdmin ? 'col-span-2' : 'col-span-1'}
          headerIcon={Users}
          headerTitle="Faculty Directory"
          headerSubtitle="All registered faculty"
          headerAction={
            <div className="flex items-center gap-2">
              <select
                className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="All">All Depts</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-40"
              />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Dept
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Credentials
                  </th>
                  {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredFaculty.length > 0 ? (
                  filteredFaculty.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                            <img
                              src={member.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100?text=?';
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {member.facultyName}
                            </p>
                            <p className="text-xs text-slate-400">{member.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">
                          {member.department}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-600">{member.qualification}</p>
                        <p className="text-xs text-slate-400">{member.totalExperience}Y exp</p>
                      </td>
                      {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/update-faculty/${member._id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <Building2 size={40} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-sm font-medium text-slate-400">
                        {searchQuery || selectedDept !== 'All'
                          ? 'No matching faculty found'
                          : 'No faculty registered'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Faculty;
