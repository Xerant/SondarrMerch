import merchApi from './merchApi';
import type { CurrentUser } from '../types/auth';

class AuthService {
  /** The caller as the Merch API sees them. 401 when signed out. */
  async me(): Promise<CurrentUser> {
    const response = await merchApi.get<CurrentUser>('/auth/me');
    return response.data;
  }

  /** Mirrors a Supabase access token into the shared .sondarr.com cookie. */
  async createSession(accessToken: string): Promise<void> {
    await merchApi.post('/auth/session', { accessToken });
  }

  /** Clears the shared cookie — signs the user out of every Sondarr site. */
  async logout(): Promise<void> {
    await merchApi.post('/auth/logout');
  }
}

export default new AuthService();
