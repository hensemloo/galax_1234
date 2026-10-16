import apiClient, { USE_MOCK, mockDelay } from './apiClient';
import { mockAssessment, mockAssessments } from '../mocks/mockData';

// Every function returns the response body (snake_case fields, like FastAPI).
// In mock mode the data comes from mocks/mockData.js after a short delay.

// Copy mock objects so screens cannot accidentally change the shared mock data.
function copy(value) {
  return structuredClone(value);
}

function notFound(id) {
  const error = new Error(`Assessment ${id} not found`);
  error.userMessage = 'Assessment not found.';
  return error;
}

export async function createAssessment(data) {
  if (USE_MOCK) {
    await mockDelay();
    return {
      ...copy(mockAssessment),
      ...data,
      id: 'A-0049',
      status: 'draft',
      current_step: 1,
      ai_result: null,
      measurements: null,
      result: null,
    };
  }
  const response = await apiClient.post('/api/assessments', data);
  return response.data;
}

// onProgress(percent) is called with 0-100 while the file uploads.
export async function uploadImage(id, file, onProgress) {
  if (USE_MOCK) {
    for (const percent of [20, 45, 70, 90, 100]) {
      await mockDelay(150);
      onProgress?.(percent);
    }
    return { id, image_filename: file?.name ?? 'sample.jpg' };
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(`/api/assessments/${id}/image`, formData, {
    onUploadProgress: (event) => {
      const total = event.total ?? file.size;
      if (total) {
        onProgress?.(Math.round((event.loaded / total) * 100));
      }
    },
  });
  return response.data;
}

export async function runAiScreening(id) {
  if (USE_MOCK) {
    await mockDelay(1500);
    return { id, ai_result: copy(mockAssessment.ai_result) };
  }
  const response = await apiClient.post(`/api/assessments/${id}/screening`);
  return response.data;
}

export async function saveMeasurements(id, data) {
  if (USE_MOCK) {
    await mockDelay();
    return { id, measurements: { ...copy(mockAssessment.measurements), ...data } };
  }
  const response = await apiClient.put(`/api/assessments/${id}/measurements`, data);
  return response.data;
}

export async function runAssessment(id) {
  if (USE_MOCK) {
    await mockDelay(800);
    return { id, result: copy(mockAssessment.result) };
  }
  const response = await apiClient.post(`/api/assessments/${id}/evaluate`);
  return response.data;
}

export async function confirmAssessment(id) {
  if (USE_MOCK) {
    await mockDelay();
    return { ...copy(mockAssessment), id, status: 'completed' };
  }
  const response = await apiClient.post(`/api/assessments/${id}/confirm`);
  return response.data;
}

export async function getAssessment(id) {
  if (USE_MOCK) {
    await mockDelay();
    const assessment = mockAssessments.find((item) => item.id === id);
    if (!assessment) {
      throw notFound(id);
    }
    return copy(assessment);
  }
  const response = await apiClient.get(`/api/assessments/${id}`);
  return response.data;
}

// params example: { status: 'draft' }
export async function listAssessments(params = {}) {
  if (USE_MOCK) {
    await mockDelay();
    const items = params.status
      ? mockAssessments.filter((item) => item.status === params.status)
      : mockAssessments;
    return copy(items);
  }
  const response = await apiClient.get('/api/assessments', { params });
  return response.data;
}

// Returns a Blob (a PDF from the backend; a small text file in mock mode).
export async function downloadReport(id) {
  if (USE_MOCK) {
    await mockDelay();
    return new Blob([`CocoaCheck Sabah mock report for assessment ${id}`], {
      type: 'text/plain',
    });
  }
  const response = await apiClient.get(`/api/assessments/${id}/report`, {
    responseType: 'blob',
  });
  return response.data;
}
