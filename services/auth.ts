const API_URL = 'https://bananaboom-api-242273127238.asia-east1.run.app/api';

export const registerUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message_cn || data.message || 'Registration failed');
  }
  return data;
};

export const loginUser = async (credentials: any) => {
  const response = await fetch(`${API_URL}/users/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message_cn || data.message || 'Login failed');
  }
  return data;
};

export const logoutUser = async (token: string) => {
    // We try to tell server, but even if it fails, client logs out
    try {
        await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
            },
        });
    } catch (e) {
        console.error("Logout API call failed", e);
    }
};
