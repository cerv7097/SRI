export const saveFormDraft = (formType, formData) => {
  try {
    const drafts = JSON.parse(localStorage.getItem('formDrafts') || '{}');
    drafts[formType] = {
      data: formData,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('formDrafts', JSON.stringify(drafts));
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
};

export const loadFormDraft = (formType) => {
  try {
    const drafts = JSON.parse(localStorage.getItem('formDrafts') || '{}');
    return drafts[formType] || null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const deleteDraft = (formType) => {
  try {
    const drafts = JSON.parse(localStorage.getItem('formDrafts') || '{}');
    delete drafts[formType];
    localStorage.setItem('formDrafts', JSON.stringify(drafts));
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
};

export const getAllDrafts = () => {
  try {
    return JSON.parse(localStorage.getItem('formDrafts') || '{}');
  } catch (error) {
    console.error('Error getting drafts:', error);
    return {};
  }
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const validateForm = (formData, requiredFields) => {
  const errors = {};
  requiredFields.forEach(field => {
    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
      errors[field] = 'This field is required';
    }
  });
  return errors;
};