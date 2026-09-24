const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'ACLogin.html';
}

document.getElementById('backToDashboard').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});