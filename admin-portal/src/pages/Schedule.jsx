import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Upload,
  Trash2,
  FileText,
  CalendarDays,
  Building2,
  Users,
  ExternalLink,
  Loader2,
  X,
  CheckCircle2,
  Eye,
  Download,
} from 'lucide-react';
import axiosInstance from '../utils/Instance';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/ui';
import { authContext } from '../context/AuthContext';

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'AIML', 'IoT'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ['A', 'B', 'C', 'D'];

const Schedule = () => {
  const { user } = useContext(authContext);
  const fileInputRef = useRef(null);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewSchedule, setPreviewSchedule] = useState(null); 

  const [form, setForm] = useState({
    departmentName: 'CSE',
    semester: 1,
    sectionName: 'A',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/schedule/all');
      setSchedules(res.data || []);
    } catch (err) {
      toast.error('Failed to load schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10 MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file first.');
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      await axiosInstance.post('/api/schedule/add', {
        ...form,
        scheduleLink: base64,
      });

      toast.success('Schedule uploaded successfully!');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await axiosInstance.delete(`/api/schedule/delete/${id}`);
      toast.success('Schedule deleted.');
      setSchedules((prev) => prev.filter((s) => s._id !== id));
    } catch {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="lg:ml-64 min-h-screen bg-slate-50 pt-20 pb-10 px-4 sm:px-8 font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          <CalendarDays size={13} />
          Timetable Manager
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Schedule</h1>
      </div>


      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <Upload size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Upload Schedule PDF</h2>
            <p className="text-xs text-slate-400 font-medium">
              Select department, semester &amp; section, then attach a PDF
            </p>
          </div>
        </div>

    
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Department
            </label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={form.departmentName}
                onChange={(e) => setForm((f) => ({ ...f, departmentName: e.target.value }))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Semester
            </label>
            <div className="relative">
              <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: Number(e.target.value) }))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Section
            </label>
            <div className="relative">
              <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={form.sectionName}
                onChange={(e) => setForm((f) => ({ ...f, sectionName: e.target.value }))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-slate-900 bg-slate-50'
              : selectedFile
              ? 'border-green-400 bg-green-50'
              : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          {selectedFile ? (
            <>
              <CheckCircle2 size={36} className="text-green-500 mb-3" />
              <p className="text-sm font-black text-slate-800">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="mt-3 flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
              >
                <X size={12} /> Remove
              </button>
            </>
          ) : (
            <>
              <FileText size={36} className="text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-500">Click to choose or drag &amp; drop a PDF</p>
              <p className="text-xs text-slate-400 mt-1">PDF files only · Max 10 MB</p>
            </>
          )}
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm px-6 py-3 rounded-xl transition-all duration-200 active:scale-95"
          >
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading…</>
            ) : (
              <><Upload size={16} /> Upload Schedule</>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <FileText size={18} className="text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Uploaded Schedules</h2>
            <p className="text-xs text-slate-400 font-medium">
              {schedules.length} {schedules.length === 1 ? 'file' : 'files'} total
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <FileText size={48} className="mb-3" />
            <p className="text-sm font-bold">No schedules uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest pb-3 pr-4">Department</th>
                  <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest pb-3 pr-4">Semester</th>
                  <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest pb-3 pr-4">Section</th>
                  <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest pb-3 pr-4">Uploaded</th>
                  <th className="text-right text-[11px] font-black text-slate-400 uppercase tracking-widest pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schedules.map((s) => (
                  <tr key={s._id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-black text-slate-700">
                        <Building2 size={11} />
                        {s.departmentName}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">Sem {s.semester}</td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-black text-blue-600">
                        <Users size={11} />
                        Section {s.sectionName}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-400 font-medium">
                      {new Date(s.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewSchedule({ url: s.scheduleLink, label: `${s.departmentName} · Sem ${s.semester} · Sec ${s.sectionName}` })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors"
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-bold text-red-500 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewSchedule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewSchedule(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <FileText size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Timetable Preview</p>
                  <h3 className="text-sm font-black text-slate-900">{previewSchedule.label}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewSchedule.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-xs font-black transition-colors"
                >
                  <Download size={13} /> Download
                </a>
                <button
                  onClick={() => setPreviewSchedule(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewSchedule.url)}&embedded=true`}
                className="w-full h-full border-0"
                title="Schedule PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
