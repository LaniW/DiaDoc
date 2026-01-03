const API_BASE = '/api';

export async function generateFromLink(url) {
  try {
    const response = await fetch(`${API_BASE}/link/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error generating from link:', error);
    return { success: false, error: error.message };
  }
}

export async function generateFromDocs(docText) {
  try {
    const response = await fetch(`${API_BASE}/docs/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docText })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error generating from docs:', error);
    return { success: false, error: error.message };
  }
}
