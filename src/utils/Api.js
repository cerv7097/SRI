const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Authentication APIs
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      // Token is invalid, clear it
      logout();
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    logout();
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Form APIs (updated to use auth headers)
export const submitForm = async (formType, formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${formType}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Form submission failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};

export const getFormHistory = async (formType, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${formType}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch form history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching form history:', error);
    throw error;
  }
};

export const getFormById = async (formType, formId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${formType}/${formId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch form');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching form:', error);
    throw error;
  }
};

export const getJobSites = async (limit = 15) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/meta/job-sites?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Failed to fetch job sites');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching job sites:', error);
    throw error;
  }
};

export const uploadSignature = async (signatureDataURL) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signatures/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ signature: signatureDataURL }),
    });

    if (!response.ok) {
      throw new Error('Signature upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading signature:', error);
    throw error;
  }
};

export const saveDraft = async (formType, formData) => {
  try {
    const draftData = { ...formData, status: 'draft' };
    const response = await fetch(`${API_BASE_URL}/forms/${formType}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(draftData),
    });

    if (!response.ok) {
      throw new Error('Failed to save draft');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const updateForm = async (formType, formId, formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${formType}/${formId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to update form');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating form:', error);
    throw error;
  }
};

export const exportFormToPDF = async (formType, formId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${formType}/${formId}/export`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('PDF export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formType}-${formId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

export const deleteForm = async (formType, formId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/${formType}/${formId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete form');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting form:', error);
    throw error;
  }
};

export const updateJobSiteStatus = async (jobName, address, isActive) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/meta/job-sites/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ jobName, address, isActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to update job site status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating job site status:', error);
    throw error;
  }
};

// Two-Factor Authentication APIs

export const setupTwoFactor = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to setup 2FA');
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    throw error;
  }
};

export const verifyTwoFactorSetup = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/verify-setup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify 2FA');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying 2FA setup:', error);
    throw error;
  }
};

export const verifyTwoFactorLogin = async (tempToken, code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/verify-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tempToken, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '2FA verification failed');
    }

    const data = await response.json();

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Error verifying 2FA login:', error);
    throw error;
  }
};

export const disableTwoFactor = async (password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to disable 2FA');
    }

    return await response.json();
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    throw error;
  }
};
