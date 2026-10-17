import React, { useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  GraduationCap,
  Clock,
  Building2,
  Sparkles,
  Save,
  RefreshCw,
  Globe,
  EyeOff,
  CheckCircle2,
  X,
  Plus,
  Tag,
  AlertCircle,
  FileText,
  Archive,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { FormField } from '../../ui/FormField';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { useToast } from '../../ui/ToastContext';
import {
  createCareer,
  updateCareer,
  publishCareer,
  unpublishCareer,
  closeCareer,
  withdrawCareer,
  reopenCareer,
} from '../../../utils/career.service';

const DEPARTMENT_OPTIONS = [
  'Technology',
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Human Resources',
  'Operations',
];

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

const COMMON_SKILLS = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'TailwindCSS',
  'TypeScript',
  'Node.js',
  'Next.js',
  'Python',
  'REST APIs',
  'Git',
  'SQL',
];

const parseSkills = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return ['HTML', 'CSS', 'JavaScript', 'React', 'TailwindCSS'];
};

export const CreateCareer = ({
  initialCareer = null,
  initialJob = null,
  onBack,
  onSuccess,
}) => {
  const currentItem = initialCareer || initialJob;
  const isEditing = Boolean(currentItem?.id);
  const careerId = currentItem?.id;

  const { addToast } = useToast();

  // Form State strictly adhering to specified backend payload
  const [formData, setFormData] = useState({
    title: currentItem?.title || '',
    experience: currentItem?.experience || '',
    location: currentItem?.location || '',
    qualification: currentItem?.qualification || '',
    description: currentItem?.description || '',
    requirements: currentItem?.requirements || '',
    department: currentItem?.department || 'Technology',
    employment_type: currentItem?.employment_type || 'full_time',
    status: currentItem?.status || 'draft',
  });

  // Skills array state
  const [skillsList, setSkillsList] = useState(() => parseSkills(currentItem?.skills));
  const [skillInput, setSkillInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusBusy, setIsStatusBusy] = useState(false);

  // Skill tag add
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim().replace(/^[,\s]+|[,\s]+$/g, '');
    if (trimmed && !skillsList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillsList([...skillsList, trimmed]);
      setSkillInput('');
      if (formErrors.skills) {
        setFormErrors((prev) => ({ ...prev, skills: '' }));
      }
    }
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  // Skill tag remove
  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Job title is required.';
    }
    if (!formData.experience.trim()) {
      errors.experience = 'Required experience is required (e.g. 2-4 years).';
    }
    if (!formData.location.trim()) {
      errors.location = 'Job location is required (e.g. Kochi, Kerala).';
    }
    if (!formData.qualification.trim()) {
      errors.qualification = 'Minimum qualification is required.';
    }
    if (skillsList.length === 0) {
      errors.skills = 'Please specify at least one required skill tag.';
    }
    if (!formData.description.trim()) {
      errors.description = 'Job overview description is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (overrideStatus = null) => {
    if (!validateForm()) {
      addToast({
        title: 'Validation Failed',
        message: 'Please fill in all required fields before submitting.',
        type: 'error',
      });
      return;
    }

    const targetStatus = overrideStatus || formData.status || 'draft';

    const payload = {
      title: formData.title.trim(),
      experience: formData.experience.trim(),
      skills: skillsList,
      location: formData.location.trim(),
      qualification: formData.qualification.trim(),
      description: formData.description.trim(),
      requirements: formData.requirements.trim(),
      department: formData.department.trim(),
      employment_type: formData.employment_type,
      status: targetStatus,
    };

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateCareer(careerId, payload);
        addToast({
          title: 'Career Updated',
          message: `Position "${formData.title}" updated successfully.`,
          type: 'success',
        });
      } else {
        await createCareer(payload);
        addToast({
          title: 'Career Created',
          message: `Position "${formData.title}" created with status "${targetStatus}".`,
          type: 'success',
        });
      }

      if (onSuccess) {
        onSuccess(payload);
      }
    } catch (err) {
      addToast({
        title: isEditing ? 'Update Failed' : 'Creation Failed',
        message: err?.response?.data?.message || err?.message || 'Could not save career position.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fast Status Actions for Editing Mode
  const handleStatusAction = async (actionFn, actionName, nextStatus) => {
    if (!careerId) return;
    setIsStatusBusy(true);
    try {
      await actionFn(careerId);
      setFormData((prev) => ({ ...prev, status: nextStatus }));
      addToast({
        title: `Status Changed`,
        message: `Career position is now marked as ${nextStatus}.`,
        type: 'success',
      });
      if (onSuccess) {
        onSuccess({ ...formData, status: nextStatus });
      }
    } catch (err) {
      addToast({
        title: `${actionName} Failed`,
        message: err?.response?.data?.message || err?.message || `Could not ${actionName.toLowerCase()} career.`,
        type: 'error',
      });
    } finally {
      setIsStatusBusy(false);
    }
  };

  // Status badge styling
  const statusKey = (formData.status || 'draft').toLowerCase();
  let badgeVariant = 'Draft';
  if (statusKey === 'published' || statusKey === 'active') badgeVariant = 'Active';
  else if (statusKey === 'closed' || statusKey === 'unpublish' || statusKey === 'unpublished') badgeVariant = 'Closed';
  else if (statusKey === 'withdrawn') badgeVariant = 'Error';

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16">
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', onClick: onBack },
              { label: 'Careers', onClick: onBack },
              { label: isEditing ? `Edit: ${formData.title || 'Opening'}` : 'Create Career Opening' },
            ]}
          />

          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Return to careers list"
            >
              <ArrowLeft size={18} />
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isEditing
                ? formData.title
                  ? `Edit: ${formData.title}`
                  : 'Edit Career Opening'
                : 'Create Career Opening'}
            </h1>

            <Badge status={badgeVariant}>
              {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
            </Badge>

            {isEditing && careerId && (
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                ID #{careerId}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button variant="secondary" onClick={onBack} disabled={isSaving}>
            Cancel
          </Button>

          {/* Quick status actions when editing */}
          {isEditing && (
            <>
              {statusKey !== 'published' && (
                <Button
                  variant="secondary"
                  icon={Globe}
                  onClick={() => handleStatusAction(publishCareer, 'Publish', 'published')}
                  isLoading={isStatusBusy}
                >
                  Publish
                </Button>
              )}

              {statusKey === 'published' && (
                <Button
                  variant="secondary"
                  icon={EyeOff}
                  onClick={() => handleStatusAction(unpublishCareer, 'Unpublish', 'draft')}
                  isLoading={isStatusBusy}
                >
                  Unpublish
                </Button>
              )}

              {statusKey !== 'closed' && (
                <Button
                  variant="secondary"
                  icon={Archive}
                  onClick={() => handleStatusAction(closeCareer, 'Close', 'closed')}
                  isLoading={isStatusBusy}
                >
                  Close
                </Button>
              )}

              {statusKey === 'closed' && (
                <Button
                  variant="secondary"
                  icon={RotateCcw}
                  onClick={() => handleStatusAction(reopenCareer, 'Reopen', 'published')}
                  isLoading={isStatusBusy}
                >
                  Reopen
                </Button>
              )}
            </>
          )}

          {/* Save as Draft quick button */}
          {!isEditing && (
            <Button
              variant="secondary"
              onClick={() => handleSubmit('draft')}
              disabled={isSaving}
              icon={FileText}
            >
              Save as Draft
            </Button>
          )}

          <Button
            variant="primary"
            icon={isSaving ? RefreshCw : Save}
            onClick={() => handleSubmit()}
            isLoading={isSaving}
          >
            {isEditing ? 'Save Changes' : 'Create Career'}
          </Button>
        </div>
      </div>

      {/* 2. TWO-COLUMN RESPONSIVE FORM LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: PRIMARY FIELDS (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* GENERAL VACANCY DETAILS CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Briefcase size={18} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Position Overview & Classification
              </h2>
            </div>

            {/* Job Title */}
            <FormField
              label="Job Position Title"
              required
              error={formErrors.title}
              helperText="Enter the official role title as displayed to applicants."
            >
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                }}
                placeholder="e.g. Frontend Developer"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  formErrors.title
                    ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
            </FormField>

            {/* Department and Employment Type (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Department"
                required
                helperText="Select or assign this vacancy to a department."
              >
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </FormField>

              <FormField
                label="Employment Type"
                required
                helperText="Working arrangement and commitment."
              >
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </FormField>
            </div>

            {/* Required Experience and Location (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Required Experience"
                required
                error={formErrors.experience}
                helperText="e.g. 2-4 years, Entry level, Senior 5+ years"
              >
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => {
                      setFormData({ ...formData, experience: e.target.value });
                      if (formErrors.experience) setFormErrors({ ...formErrors, experience: '' });
                    }}
                    placeholder="e.g. 2-4 years"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                      formErrors.experience
                        ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                </div>

                {/* Experience quick chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {['0-1 years', '2-4 years', '3-5 years', '5+ years'].map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setFormData({ ...formData, experience: exp })}
                      className={`text-xs px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        formData.experience === exp
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField
                label="Location"
                required
                error={formErrors.location}
                helperText="Primary office or remote location."
              >
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (formErrors.location) setFormErrors({ ...formErrors, location: '' });
                    }}
                    placeholder="e.g. Kochi, Kerala"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                      formErrors.location
                        ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                </div>

                {/* Location quick chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {['Kochi, Kerala', 'Bengaluru, Karnataka', 'Remote', 'Hybrid'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setFormData({ ...formData, location: loc })}
                      className={`text-xs px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        formData.location === loc
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            {/* Qualification */}
            <FormField
              label="Minimum Qualification"
              required
              error={formErrors.qualification}
              helperText="Educational or professional credential requirements."
            >
              <div className="relative">
                <GraduationCap size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => {
                    setFormData({ ...formData, qualification: e.target.value });
                    if (formErrors.qualification) setFormErrors({ ...formErrors, qualification: '' });
                  }}
                  placeholder="e.g. Bachelor's degree in Computer Science or a related field"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                    formErrors.qualification
                      ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
              </div>
            </FormField>
          </div>

          {/* REQUIRED SKILLS CARD (TAGS) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Required Skills & Technologies
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {skillsList.length} Selected
              </span>
            </div>

            <FormField
              label="Add Required Skill Tags"
              required
              error={formErrors.skills}
              helperText="Type a skill and press Enter or comma. You can also click the quick-add suggestions below."
            >
              {/* Tags container */}
              <div
                className={`p-2.5 rounded-lg border bg-white flex flex-wrap gap-2 items-center min-h-[48px] transition-all focus-within:ring-2 ${
                  formErrors.skills
                    ? 'border-red-300 focus-within:ring-red-100'
                    : 'border-slate-300 focus-within:border-indigo-500 focus-within:ring-indigo-100'
                }`}
              >
                {skillsList.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium shadow-2xs animate-fade-in"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-indigo-700 p-0.5 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
                      title={`Remove ${skill}`}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDownSkill}
                  onBlur={() => {
                    if (skillInput.trim()) handleAddSkill(skillInput);
                  }}
                  placeholder={
                    skillsList.length === 0
                      ? 'Type skill (e.g. React) and press Enter...'
                      : 'Add another skill...'
                  }
                  className="flex-1 min-w-[160px] border-none outline-none text-sm text-slate-800 bg-transparent py-1 px-1"
                />
              </div>
            </FormField>

            {/* Quick Skill Suggestions */}
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-500" />
                <span>Common Skills (click to quickly add):</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COMMON_SKILLS.map((skill) => {
                  const isSelected = skillsList.some(
                    (s) => s.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      disabled={isSelected}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600'
                      }`}
                    >
                      {isSelected ? <Check size={12} /> : <Plus size={12} />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* JOB DESCRIPTION CARD (WYSIWYG) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Role Overview & Description
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Supports rich text formatting
              </span>
            </div>

            <FormField
              label="Job Description"
              required
              error={formErrors.description}
              helperText="Comprehensive outline of the role, daily responsibilities, and team impact."
            >
              <RichTextEditor
                value={formData.description}
                onChange={(val) => {
                  setFormData({ ...formData, description: val });
                  if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                }}
                placeholder="We are looking for a skilled Frontend Developer to join our core product team..."
                minHeight="220px"
                label="Job Description"
              />
            </FormField>
          </div>

          {/* REQUIREMENTS CARD (WYSIWYG) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Candidate Requirements & Qualifications
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Key competencies and credentials
              </span>
            </div>

            <FormField
              label="Requirements Specification"
              helperText="Detail technical capabilities, problem solving, API knowledge, or certifications."
            >
              <RichTextEditor
                value={formData.requirements}
                onChange={(val) => setFormData({ ...formData, requirements: val })}
                placeholder="Strong problem-solving skills, experience with React hooks and REST APIs..."
                minHeight="200px"
                label="Candidate Requirements"
              />
            </FormField>
          </div>
        </div>

        {/* RIGHT COLUMN: PUBLISHING & PREVIEW (1 Col) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* PUBLICATION STATUS CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Publishing Lifecycle Status
            </h3>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  id: 'draft',
                  title: 'Draft',
                  desc: 'Saved internally. Hidden from public careers portal.',
                  badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
                },
                {
                  id: 'published',
                  title: 'Published',
                  desc: 'Live on the website and accepting incoming job applications.',
                  badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                },
                {
                  id: 'closed',
                  title: 'Closed',
                  desc: 'Position filled or closed to new applications.',
                  badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
                },
                {
                  id: 'withdrawn',
                  title: 'Withdrawn',
                  desc: 'Position cancelled or revoked.',
                  badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
                },
              ].map((opt) => {
                const isSelected = formData.status === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setFormData({ ...formData, status: opt.id })}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${opt.badgeClass}`}>
                          {opt.title}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 mt-0.5 leading-normal">
                        {opt.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* VACANCY PREVIEW CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-3.5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Card Preview</span>
              <span className="text-[11px] font-normal text-slate-400 capitalize">
                {formData.employment_type.replace('_', ' ')}
              </span>
            </h3>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {formData.department || 'Department'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {formData.title || 'Job Position Title'}
                  </h4>
                </div>
                <Badge status={badgeVariant} size="sm">
                  {statusKey}
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{formData.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase size={13} className="text-slate-400 shrink-0" />
                  <span>{formData.experience || 'Experience not set'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{formData.qualification || 'Qualification not set'}</span>
                </div>
              </div>

              {/* Skills tags preview */}
              <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-slate-200/60">
                {skillsList.slice(0, 4).map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[10.5px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium"
                  >
                    {s}
                  </span>
                ))}
                {skillsList.length > 4 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    +{skillsList.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM QUICK SAVE CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <Button
              variant="primary"
              fullWidth
              icon={isSaving ? RefreshCw : Save}
              onClick={() => handleSubmit()}
              isLoading={isSaving}
            >
              {isEditing ? 'Save Changes' : 'Create Career Opening'}
            </Button>

            {!isEditing && (
              <Button
                variant="secondary"
                fullWidth
                icon={FileText}
                onClick={() => handleSubmit('draft')}
                disabled={isSaving}
              >
                Save as Draft
              </Button>
            )}

            <Button variant="ghost" fullWidth onClick={onBack} disabled={isSaving}>
              Cancel and Return
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCareer;