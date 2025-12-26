// Sample certificates data with localStorage
let certificates = JSON.parse(localStorage.getItem('certificates')) || [
  {
    title: 'AWS Cloud Practitioner',
    provider: 'Amazon Web Services',
    issueDate: '2024-01-15',
    expiryDate: '2026-01-15',
    fileUrl: '#'
  },
  {
    title: 'Google Cloud Associate',
    provider: 'Google Cloud',
    issueDate: '2024-06-20',
    expiryDate: '2025-06-20',
    fileUrl: '#'
  },
  {
    title: 'Azure Fundamentals',
    provider: 'Microsoft',
    issueDate: '2023-03-10',
    expiryDate: '2024-12-10',
    fileUrl: '#'
  }
];

// Save to localStorage
function saveCertificates() {
  localStorage.setItem('certificates', JSON.stringify(certificates));
}

// Calculate days until expiry
function calculateDaysLeft(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Get status based on days left
function getStatus(daysLeft) {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 60) return 'soon';
  return 'active';
}

// Render certificate cards
function renderCertificates(filter = 'all') {
  const container = document.getElementById('certList');
  const soonCount = certificates.filter(c => getStatus(calculateDaysLeft(c.expiryDate)) === 'soon').length;
  document.getElementById('expSoonCount').textContent = soonCount;

  let filteredCerts = certificates;
  if (filter !== 'all') {
    filteredCerts = certificates.filter(cert => {
      const status = getStatus(calculateDaysLeft(cert.expiryDate));
      return status === filter;
    });
  }

  container.innerHTML = '';

  if (filteredCerts.length === 0) {
    container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 2rem;">No certificates found for this filter.</p>';
    return;
  }

  filteredCerts.forEach((cert, index) => {
    const daysLeft = calculateDaysLeft(cert.expiryDate);
    const status = getStatus(daysLeft);

    const badgeClass = `badge badge-${status}`;
    const statusText = status === 'expired' ? 'Expired' : status === 'soon' ? 'Expiring Soon' : 'Active';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">${cert.title}</div>
          <div class="card-provider">${cert.provider}</div>
        </div>
        <span class="${badgeClass}">${statusText}</span>
      </div>
      <div class="card-meta">Issue: ${new Date(cert.issueDate).toLocaleDateString()} | Expiry: ${new Date(cert.expiryDate).toLocaleDateString()}</div>
      <div class="card-meta">${daysLeft >= 0 ? daysLeft + ' days left' : 'Expired ' + Math.abs(daysLeft) + ' days ago'}</div>
      <button class="primary-btn" style="margin-top: 0.5rem; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="openModal(${index})">View Details</button>
    `;
    container.appendChild(card);
  });
}

// Filter button handling
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.chip');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      renderCertificates(filter);
    });
  });

  // Initial render
  renderCertificates();

  // Form submission
  const form = document.getElementById('certForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const provider = document.getElementById('provider').value;
    const issueDate = document.getElementById('issueDate').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const fileInput = document.getElementById('file');

    let fileUrl = '#';
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = function(event) {
        fileUrl = event.target.result;
        addCertificate({ title, provider, issueDate, expiryDate, fileUrl });
      };
      reader.readAsDataURL(file);
    } else {
      addCertificate({ title, provider, issueDate, expiryDate, fileUrl });
    }
  });
});

function addCertificate(cert) {
  certificates.push(cert);
  saveCertificates();
  renderCertificates();
  showToast();
  document.getElementById('certForm').reset();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toast notification
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Modal handling
function openModal(index) {
  const cert = certificates[index];
  const modal = document.getElementById('modal');
  document.getElementById('modalTitle').textContent = cert.title;
  document.getElementById('modalMeta').textContent = `Provider: ${cert.provider} | Issue: ${new Date(cert.issueDate).toLocaleDateString()} | Expiry: ${new Date(cert.expiryDate).toLocaleDateString()}`;
  document.getElementById('modalLink').href = cert.fileUrl;
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('show');
}

// Scroll to form
function scrollToForm() {
  document.getElementById('add-cert').scrollIntoView({ behavior: 'smooth' });
}
