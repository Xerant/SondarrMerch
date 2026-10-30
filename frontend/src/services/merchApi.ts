import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_MERCH_API_URL || 'http://localhost:5010/api';

/**
 * The one Axios instance for the Merch API.
 * - withCredentials: sends the shared .sondarr.com session cookie, so a user
 *   signed in on another Sondarr site is signed in here too.
 * - Bearer header when this tab has its own Supabase session (header wins
 *   over the cookie server-side).
 */
const merchApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

merchApi.interceptors.request.use(async (config) => {
  // getSession() refreshes an expired token first.
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default merchApi;
