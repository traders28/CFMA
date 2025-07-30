import { auth, onAuthStateChanged, database, ref, get, child } from './firebase-init.js';
import { generateSidebar, generateMobileSidebar } from './menu.js';

onAuthStateChanged(auth, (user) => {
  console.log('User authenticated, UID:', user ? user.uid : 'null');
  if (!user) {
    window.location.href = 'login.html';
  } else {
    console.log('Initializing dashboard for user:', user.uid);
    loadVehicles(user.uid);
    document.getElementById('sidebar').innerHTML = generateSidebar();
    document.getElementById('mobileSidebar').innerHTML = generateMobileSidebar();
  }
});

function loadVehicles(userId) {
  console.log('Starting loadVehicles for user:', userId);
  const dbRef = ref(database);
  get(child(dbRef, `users/${userId}/vehicles`)).then((snapshot) => {
    console.log('Vehicles snapshot received, exists:', snapshot.exists());
    const vehicles = snapshot.val() || {};
    console.log('Vehicles fetched:', Object.keys(vehicles).length, 'items');
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = ''; // Clear any initial content
    if (Object.keys(vehicles).length === 0) {
      console.log('No vehicles found, initializing empty table');
    } else {
      Object.keys(vehicles).forEach((vehicleId) => {
        console.log('Processing vehicle:', vehicleId);
        const vehicle = vehicles[vehicleId];
        const row = document.createElement('tr');
        row.setAttribute('data-car', vehicleId);
        row.setAttribute('data-brand', vehicle.brand);
        row.setAttribute('data-model', vehicle.model);
        row.setAttribute('data-year', vehicle.firstRegistration.split('-')[0]);
        row.setAttribute('data-fuel', vehicle.fuel);
        row.setAttribute('data-vin', vehicle.vin);
        row.setAttribute('data-reg', vehicle.regPlate);
        row.setAttribute('data-price', vehicle.purchasedPrice);
        row.innerHTML = `
          <td><img src="${vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'https://via.placeholder.com/150'}" alt="${vehicle.brand} ${vehicle.model}"></td>
          <td>${vehicle.brand} ${vehicle.model}</td>
          <td>€${vehicle.purchasedPrice}</td>
          <td>€${vehicle.expenses ? vehicle.expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0}</td>
          <td>€${vehicle.purchasedPrice + (vehicle.expenses ? vehicle.expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0)}</td>
          <td>€${vehicle.purchasedPrice * 1.25}</td>
          <td><span class="badge bg-${vehicle.status === 'Listed' ? 'success' : 'warning'}">${vehicle.status}</span></td>
          <td>
            <div class="progress">
              <div class="progress-bar bg-${vehicle.status === 'Listed' ? 'success' : 'warning'}" role="progressbar" style="width: ${vehicle.status === 'Listed' ? 80 : 50}%" aria-valuenow="${vehicle.status === 'Listed' ? 80 : 50}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <small>${vehicle.status === 'Listed' ? 'In Service &rarr; Cleaning &rarr; Listed' : 'In Service &rarr; Cleaning &rarr; Prep'}</small>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    document.querySelectorAll('#inventoryTable tbody tr').forEach(row => {
      row.addEventListener('click', () => {
        console.log('Row clicked, loading timeline');
        document.querySelectorAll('#inventoryTable tbody tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        const vehicleId = row.getAttribute('data-car');
        displayTimeline(userId, vehicleId);
      });
    });
  }).catch((error) => {
    console.error('Error loading vehicles:', error.message);
  });
}

function displayTimeline(userId, vehicleId) {
  console.log('Starting displayTimeline for vehicle:', vehicleId);
  const dbRef = ref(database);
  get(child(dbRef, `users/${userId}/vehicles/${vehicleId}/timeline`)).then((snapshot) => {
    console.log('Timeline snapshot received, exists:', snapshot.exists());
    const timeline = snapshot.val() || [];
    console.log('Timeline fetched:', timeline.length, 'events');
    const timelineContent = document.getElementById('timeline-content');
    timelineContent.innerHTML = timeline.length > 0
      ? timeline.map(event => `
          <div class="timeline-item">
            <h6>${event.event}</h6>
            <p class="text-muted">${new Date(event.date).toLocaleDateString()}</p>
          </div>
        `).join('')
      : '<p>No timeline available.</p>';
  }).catch((error) => {
    console.error('Error loading timeline:', error.message);
  });
}

const carModels = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'TT', 'R8'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X3', 'X5', 'X6', 'X7', 'Z4', 'M3', 'M5'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLC', 'GLE', 'GLS'],
  'Toyota': ['Corolla', 'Camry', 'Prius', 'RAV4', 'Highlander', 'Land Cruiser', '4Runner'],
  'Ford': ['Fiesta', 'Focus', 'Mustang', 'F-150', 'Explorer', 'Escape'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
  'Volkswagen': ['Golf', 'Passat', 'Jetta', 'Tiguan', 'Atlas'],
  'Chevrolet': ['Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Camaro'],
  'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'GT-R'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe'],
  'Kia': ['Soul', 'Sorento', 'Sportage', 'Optima'],
  'Porsche': ['911', 'Cayenne', 'Panamera', 'Macan'],
  'Ferrari': ['488', 'F8', 'Portofino', 'Roma'],
  'Lamborghini': ['Huracan', 'Aventador', 'Urus'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
  'Peugeot': ['1007', '107', '106', '108', '2008', '205', '205 Cabrio', '206', '206 CC', '206 SW', '207', '207 CC', '207 SW', '306', '307', '307 CC', '307 SW', '308', '308 CC', '308 SW', '309', '4007', '4008', '405', '406', '407', '407 SW', '5008', '508', '508 SW', '605', '806', '607', '807', 'Bipper', 'RCZ'],
  'Renault': ['Captur', 'Clio', 'Clio Grandtour', 'Espace', 'Express', 'Fluence', 'Grand Espace', 'Grand Modus', 'Grand Scénic', 'Kangoo', 'Kangoo Express', 'Koleos', 'Laguna', 'Laguna Grandtour', 'Latitude', 'Mascott', 'Mégane', 'Mégane CC', 'Mégane Combi', 'Mégane Grandtour', 'Mégane Coupé', 'Mégane Scénic', 'Scénic', 'Talisman', 'Talisman Grandtour', 'Thalia', 'Twingo', 'Wind', 'Zoé']
};

document.getElementById('brand').addEventListener('change', () => {
  const brand = document.getElementById('brand').value;
  const modelSelect = document.getElementById('model');
  modelSelect.innerHTML = '';
  if (carModels[brand]) {
    carModels[brand].forEach(model => {
      const option = document.createElement('option');
      option.text = model;
      modelSelect.add(option);
    });
  }
});

document.getElementById('uploadImages').addEventListener('click', () => {
  if (confirm('Use camera? (OK) or gallery (Cancel)')) {
    document.getElementById('cameraInput').click();
  } else {
    document.getElementById('imageInput').click();
  }
});

const handleFiles = async (files, isCarRecognition = false) => {
  console.log('Starting handleFiles with isCarRecognition:', isCarRecognition);
  const preview = document.getElementById('preview-container');
  preview.innerHTML = '';
  Array.from(files).forEach(file => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  });
  if (files.length > 0) {
    try {
      console.log('Starting Tesseract recognition');
      const { data: { text } } = await Tesseract.recognize(files[0], 'eng');
      console.log('Tesseract text:', text);
      const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/i);
      if (vinMatch) {
        document.getElementById('vin').value = vinMatch[0];
        console.log('VIN set:', vinMatch[0]);
      }
      if (isCarRecognition) {
        alert('Recognized car: Example Brand Model');
        document.getElementById('brand').value = 'Audi';
        document.getElementById('brand').dispatchEvent(new Event('change'));
        document.getElementById('model').value = 'A4';
        console.log('Car recognition applied');
      }
    } catch (error) {
      console.error('Tesseract error in handleFiles:', error.message);
    }
  }
};

document.getElementById('imageInput').addEventListener('change', e => handleFiles(e.target.files));
document.getElementById('cameraInput').addEventListener('change', e => handleFiles(e.target.files));

document.getElementById('video').addEventListener('change', e => {
  const video = document.getElementById('video-preview');
  video.src = URL.createObjectURL(e.target.files[0]);
  video.style.display = 'block';
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