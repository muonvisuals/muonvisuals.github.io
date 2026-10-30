'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const services = document.querySelectorAll('.services details');
services.forEach(item => item.addEventListener('toggle', () => {
  if (item.open) services.forEach(other => { if (other !== item) other.open = false; });
}));
