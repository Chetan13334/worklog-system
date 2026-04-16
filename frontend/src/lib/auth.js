export function saveAuth(token, user) {
  localStorage.setItem('attendance_token', token);
  localStorage.setItem('attendance_user', JSON.stringify(user));
}

export function getAuthUser() {
  const raw = localStorage.getItem('attendance_user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('attendance_token'));
}

export function logout() {
  localStorage.removeItem('attendance_token');
  localStorage.removeItem('attendance_user');
}
