const STEAM_AUTH_URL = 'https://functions.poehali.dev/c133b2ca-4363-4e01-b7d2-eb6a29cf1dd8';
const PLAYER_STATS_URL = 'https://functions.poehali.dev/54956105-fee3-4517-8d4c-2559a22d6234';

export interface User {
  id: number;
  steam_id: string;
  username: string;
  avatar_url: string;
}

export interface PlayerStats {
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  kd_ratio: number;
  matches_played: number;
  matches_won: number;
  win_rate: number;
  headshot_rate: number;
  playtime_hours: number;
  level: number;
  experience: number;
  rank: number;
}

export const authService = {
  async login() {
    const returnUrl = window.location.origin;
    const response = await fetch(`${STEAM_AUTH_URL}?return_url=${encodeURIComponent(returnUrl)}`);
    const data = await response.json();
    
    if (data.redirect_url) {
      window.location.href = data.redirect_url;
    }
  },

  async handleCallback(queryParams: URLSearchParams): Promise<User | null> {
    const params: Record<string, string> = {};
    queryParams.forEach((value, key) => {
      params[key] = value;
    });
    
    if (!params['openid.claimed_id']) {
      return null;
    }
    
    const query = new URLSearchParams({ ...params, action: 'callback' });
    const response = await fetch(`${STEAM_AUTH_URL}?${query.toString()}`);
    const data = await response.json();
    
    if (data.success && data.session_token) {
      localStorage.setItem('session_token', data.session_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    }
    
    return null;
  },

  async verify(): Promise<User | null> {
    const token = localStorage.getItem('session_token');
    if (!token) return null;
    
    const response = await fetch(`${STEAM_AUTH_URL}?action=verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.valid) {
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      }
    }
    
    this.logout();
    return null;
  },

  logout() {
    const token = localStorage.getItem('session_token');
    if (token) {
      fetch(`${STEAM_AUTH_URL}?action=logout`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('session_token');
  }
};

export const statsService = {
  async getStats(): Promise<{ user: User; stats: PlayerStats } | null> {
    const token = localStorage.getItem('session_token');
    if (!token) return null;
    
    const response = await fetch(PLAYER_STATS_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  },

  async updateStats(stats: Partial<PlayerStats>): Promise<{ user: User; stats: PlayerStats } | null> {
    const token = localStorage.getItem('session_token');
    if (!token) return null;
    
    const response = await fetch(PLAYER_STATS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stats)
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  }
};
