import { auth, database, ref, set } from './firebase-init.js';

document.getElementById('uploadImages').addEventListener('click', () => {
  if (confirm('Use camera? (OK) or gallery (Cancel)')) {
    document.getElementById('cameraInput').click();
  } else {
    document.getElementById('imageInput').click();
  }
});

const handleFiles = (files) => {
  const preview = document.getElementById('preview-container');
  preview.innerHTML = '';
  Array.from(files).forEach(file => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  });
  if (files.length > 0) {
    Tesseract.recognize(files[0], 'eng').then(({ data: { text } }) => {
      const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/i);
      if (vinMatch) {
        document.getElementById('vin').value = vinMatch[0];
      }
    });
  }
};

document.getElementById('imageInput').addEventListener('change', e => handleFiles(e.target.files));
document.getElementById('cameraInput').addEventListener('change', e => handleFiles(e.target.files));

document.getElementById('video').addEventListener('change', e => {
  const video = document.getElementById('video-preview');
  video.src = URL.createObjectURL(e.target.files[0]);
  video.style.display = 'block';
});

document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    alert('Please log in to save a vehicle.');
    window.location.href = 'login.html';
    return;
  }

  const vehicle = {
    type: document.getElementById('type').value,
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    regPlate: document.getElementById('regPlate').value,
    mileage: parseInt(document.getElementById('mileage').value),
    fuel: document.getElementById('fuel').value,
    color: document.getElementById('color').value,
    moreInfo: document.getElementById('moreInfo').value,
    variant: document.getElementById('variant').value,
    engine: document.getElementById('engine').value,
    vin: document.getElementById('vin').value,
    firstRegistration: document.getElementById('firstRegistration').value,
    purchaseDate: document.getElementById('purchaseDate').value,
    purchasedPrice: parseFloat(document.getElementById('purchasedPrice').value),
    hasWarranty: document.getElementById('hasWarranty').checked,
    notes: document.getElementById('notes').value,
    images: [], // TODO: Add Firebase Storage integration for images
    video: '', // TODO: Add Firebase Storage integration for video
    status: 'In Preparation',
    expenses: [],
    timeline: [
      {
        event: 'Car Added',
        date: new Date().toISOString()
      }
    ]
  };

  try {
    const vehicleId = Date.now().toString(); // Simple ID generation
    await set(ref(database, `users/${user.uid}/vehicles/${vehicleId}`), vehicle);
    alert('Vehicle saved successfully!');
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Error saving vehicle:', error);
    alert('Error saving vehicle. Please try again.');
  }
});