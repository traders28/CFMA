import { auth, database, ref, set } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('add_vehicle.js loaded');
  document.getElementById('uploadImages').addEventListener('click', () => {
    if (confirm('Use camera? (OK) or gallery (Cancel)')) {
      document.getElementById('cameraInput').click();
    } else {
      document.getElementById('imageInput').click();
    }
  });

  const handleFiles = async (files) => {
    console.log('Starting file handling with', files.length, 'files');
    const preview = document.getElementById('preview-container');
    preview.innerHTML = '';
    Array.from(files).forEach(file => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      preview.appendChild(img);
    });
    if (files.length > 0) {
      try {
        console.log('Starting Tesseract recognition on first file');
        const { data: { text } } = await Tesseract.recognize(files[0], 'eng');
        console.log('Tesseract text extracted:', text);
        const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/i);
        if (vinMatch) {
          document.getElementById('vin').value = vinMatch[0];
          console.log('VIN matched:', vinMatch[0]);
        } else {
          console.log('No VIN match found');
        }
      } catch (error) {
        console.error('Tesseract error:', error);
      }
    } else {
      console.log('No files to process');
    }
  };

  document.getElementById('imageInput').addEventListener('change', e => handleFiles(e.target.files));
  document.getElementById('cameraInput').addEventListener('change', e => handleFiles(e.target.files));

  document.getElementById('video').addEventListener('change', e => {
    const video = document.getElementById('video-preview');
    video.src = URL.createObjectURL(e.target.files[0]);
    video.style.display = 'block';
  });

  document.getElementById('saveVehicle').addEventListener('click', async () => {
    console.log('Save Vehicle button clicked in add_vehicle.js');
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, redirecting to login');
      alert('Please log in to save a vehicle.');
      window.location.href = 'login.html';
      return;
    }
    console.log('User logged in, UID:', user.uid);

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
      images: [],
      video: '',
      status: 'In Preparation',
      expenses: [],
      timeline: [
        {
          event: 'Car Added',
          date: new Date().toISOString()
        }
      ]
    };
    console.log('Vehicle data prepared:', vehicle);

    try {
      const vehicleId = Date.now().toString();
      console.log('Generating vehicle ID:', vehicleId);
      console.log('Saving to path: users/' + user.uid + '/vehicles/' + vehicleId);
      await set(ref(database, `users/${user.uid}/vehicles/${vehicleId}`), vehicle);
      console.log('Save successful');
      alert('Vehicle saved successfully!');
      window.location.href = 'dashboard.html';
    } catch (error) {
      console.error('Error saving vehicle:', error.message);
      alert('Error saving vehicle: ' + error.message);
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('addVehicleModal'));
    modal.hide();
  });

  document.getElementById('scanPlate').addEventListener('click', () => {
    document.getElementById('plateInput').click();
  });

  document.getElementById('plateInput').addEventListener('change', async e => {
    if (e.target.files[0]) {
      console.log('Starting plate scan');
      try {
        const { data: { text } } = await Tesseract.recognize(e.target.files[0], 'eng');
        console.log('Plate text:', text);
        const plateMatch = text.match(/[A-Z0-9]{6,8}/i);
        if (plateMatch) {
          document.getElementById('regPlate').value = plateMatch[0];
          console.log('Plate set:', plateMatch[0]);
        } else {
          console.log('No plate match');
        }
      } catch (error) {
        console.error('Plate scan error:', error.message);
      }
    }
  });

  document.getElementById('uploadDocument').addEventListener('click', () => {
    document.getElementById('documentInput').click();
  });

  document.getElementById('documentInput').addEventListener('change', async e => {
    if (e.target.files[0]) {
      console.log('Starting document upload');
      try {
        const { data: { text } } = await Tesseract.recognize(e.target.files[0], 'eng');
        console.log('Document text:', text);
        const priceMatch = text.match(/(\d+[\.,]?\d*)/);
        if (priceMatch) {
          document.getElementById('purchasedPrice').value = priceMatch[0];
          console.log('Price set:', priceMatch[0]);
        }
        const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch) {
          document.getElementById('purchaseDate').value = dateMatch[0].split('/').reverse().join('-');
          console.log('Date set:', dateMatch[0]);
        }
        alert('Document recognized and saved.');
      } catch (error) {
        console.error('Document error:', error.message);
      }
    }
  });

  document.getElementById('recognizeCar').addEventListener('click', () => {
    document.getElementById('carImageInput').click();
  });

  document.getElementById('carImageInput').addEventListener('change', e => handleFiles(e.target.files, true));
});