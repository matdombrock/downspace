import type { TreeNode, Note, SearchResult } from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchTree(): Promise<TreeNode[]> {
  return request<TreeNode[]>('/tree');
}

export async function fetchNote(path: string): Promise<Note> {
  return request<Note>(`/note?path=${encodeURIComponent(path)}`);
}

export async function saveNote(path: string, content: string): Promise<void> {
  await request('/note', {
    method: 'POST',
    body: JSON.stringify({ path, content }),
  });
}

export async function deleteNote(path: string): Promise<void> {
  await request(`/note?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
}

export async function moveNote(path: string, newPath: string): Promise<void> {
  await request('/note/move', {
    method: 'POST',
    body: JSON.stringify({ path, newPath }),
  });
}

export async function createDirectory(path: string): Promise<void> {
  await request('/directory', {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}

export async function deleteDirectory(path: string): Promise<void> {
  await request(`/directory?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
}

export async function moveDirectory(path: string, newPath: string): Promise<void> {
  await request('/directory/move', {
    method: 'POST',
    body: JSON.stringify({ path, newPath }),
  });
}

export async function searchNotes(q: string, mode: 'fulltext' | 'filename' = 'filename'): Promise<SearchResult[]> {
  return request<SearchResult[]>(`/search?q=${encodeURIComponent(q)}&mode=${mode}`);
}

export async function deleteFile(path: string): Promise<void> {
  await request(`/file?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
}

export async function moveFile(path: string, newPath: string): Promise<void> {
  await request('/file/move', {
    method: 'POST',
    body: JSON.stringify({ path, newPath }),
  });
}

export async function uploadFiles(files: FileList | File[], dir: string = ''): Promise<string[]> {
  const formData = new FormData();
  for (const file of Array.from(files)) {
    formData.append('files', file);
  }
  const params = dir ? `?dir=${encodeURIComponent(dir)}` : '';
  const res = await fetch(`/api/upload${params}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  return data.files;
}
