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
    if (tbody) {
      tbody.innerHTML = '';
      if (Object.keys(vehicles).length === 0) {
        console.log('No vehicles found, initializing empty table');
      } else {
        Object.keys(vehicles).forEach((vehicleId) => {
          console.log('Processing vehicle:', vehicleId);
          const vehicle = vehicles[vehicleId];
          const row = document.createElement('tr');
          row.setAttribute('data-car', vehicleId);
          row.innerHTML = `
            <td><img src="${vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'https://placehold.co/150'}" alt="${vehicle.make} ${vehicle.model}" style="max-width: 150px;"></td>
            <td>${vehicle.make} ${vehicle.model}</td>
            <td>€${vehicle.purchasePrice || 0}</td>
            <td>€${vehicle.expenses ? vehicle.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) : 0}</td>
            <td>€${vehicle.purchasePrice ? vehicle.purchasePrice : 0}</td>
            <td>€${vehicle.purchasePrice ? vehicle.purchasePrice * 1.25 : 0}</td>
            <td><span class="badge bg-${vehicle.status === 'Listed' ? 'success' : 'warning'}">${vehicle.status || 'In Preparation'}</span></td>
            <td>
              <div class="progress">
                <div class="progress-bar bg-${vehicle.status === 'Listed' ? 'success' : 'warning'}" role="progressbar" style="width: ${vehicle.status === 'Listed' ? 80 : 50}%" aria-valuenow="${vehicle.status === 'Listed' ? 80 : 50}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <small>${vehicle.status === 'Listed' ? 'In Service &rarr; Cleaning &rarr; Listed' : 'In Service &rarr; Cleaning &rarr; Prep'}</small>
            </td>
          `;
          row.addEventListener('dblclick', () => {
            console.log('Double click on vehicle:', vehicleId);
            window.location.href = `vehicle_details.html?id=${vehicleId}`;
          });
          tbody.appendChild(row);
        });
      }

      document.querySelectorAll('#inventoryTable tbody tr').forEach(row => {
        row.addEventListener('click', () => {
          console.log('Row clicked, loading timeline for vehicle ID:', row.getAttribute('data-car'));
          document.querySelectorAll('#inventoryTable tbody tr').forEach(r => r.classList.remove('selected'));
          row.classList.add('selected');
          const vehicleId = row.getAttribute('data-car');
          displayTimeline(userId, vehicleId);
        });
      });
    } else {
      console.error('inventoryTable tbody not found');
    }
    updateStats(vehicles);
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
    if (timelineContent) {
      timelineContent.innerHTML = timeline.length > 0
        ? timeline.map(event => `
            <div class="timeline-item">
              <h6>${event.event}</h6>
              <p class="text-muted">${new Date(event.date).toLocaleDateString()}</p>
            </div>
          `).join('')
        : '<p>No timeline available.</p>';
    } else {
      console.error('timeline-content not found');
    }
  }).catch((error) => {
    console.error('Error loading timeline:', error.message);
  });
}

function updateStats(vehicles) {
  const totalVehicles = document.getElementById('totalVehicles');
  const totalExpenses = document.getElementById('totalExpenses');
  const potentialValue = document.getElementById('potentialValue');
  const belowMinPrice = document.getElementById('belowMinPrice');
  if (totalVehicles && totalExpenses && potentialValue && belowMinPrice) {
    const vehicleCount = Object.keys(vehicles).length;
    const expenseSum = Object.values(vehicles).reduce((sum, vehicle) => sum + (vehicle.expenses ? vehicle.expenses.reduce((s, e) => s + (e.amount || 0), 0) : 0), 0);
    const potentialSum = Object.values(vehicles).reduce((sum, vehicle) => sum + (vehicle.purchasePrice ? vehicle.purchasePrice * 1.25 : 0), 0);
    const belowMin = Object.values(vehicles).filter(v => v.purchasePrice && v.purchasePrice < 5000).length; // Example threshold
    totalVehicles.textContent = vehicleCount;
    totalExpenses.textContent = `€${expenseSum.toFixed(2)}`;
    potentialValue.textContent = `€${potentialSum.toFixed(2)}`;
    belowMinPrice.textContent = belowMin;
  } else {
    console.error('Stat elements not found');
  }
}

const carModels = {
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Prius'],
  'Ford': ['Fiesta', 'Focus', 'Mustang', 'F-150'],
  'Chevrolet': ['Malibu', 'Equinox', 'Silverado'],
  'Honda': ['Civic', 'Accord', 'CR-V'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson'],
  'Nissan': ['Altima', 'Sentra', 'Rogue'],
  'Volkswagen': ['Golf', 'Passat', 'Tiguan'],
  'BMW': ['3 Series', '5 Series', 'X5'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC'],
  'Audi': ['A3', 'A4', 'Q5'],
  'Kia': ['Soul', 'Sorento', 'Sportage'],
  'Subaru': ['Outback', 'Forester', 'Impreza'],
  'Jeep': ['Wrangler', 'Cherokee', 'Grand Cherokee'],
  'Porsche': ['911', 'Cayenne', 'Macan'],
  'Ferrari': ['488', 'Portofino', 'Roma'],
  'Tesla': ['Model 3', 'Model Y', 'Model S'],
  'BYD': ['Han', 'Tang', 'Song']
};

const brandSelect = document.getElementById('brand');
if (brandSelect) {
  brandSelect.addEventListener('change', () => {
    const selectedBrand = brandSelect.value;
    const modelSelect = document.getElementById('model');
    if (modelSelect) {
      modelSelect.innerHTML = '<option value="">Select Model</option>';
      if (carModels[selectedBrand]) {
        carModels[selectedBrand].forEach(model => {
          const option = document.createElement('option');
          option.value = model;
          option.textContent = model;
          modelSelect.appendChild(option);
        });
      }
    } else {
      console.error('model select not found');
    }
  });
} else {
  console.error('brand select not found');
}

function enablePopupForSvgParts() {
  console.log('Enabling popup for SVG parts');
  const svgParts = document.querySelectorAll('.car-part');
  if (svgParts.length > 0) {
    svgParts.forEach(part => {
      console.log('Setting up click event for part:', part.getAttribute('id'));
      part.style.cursor = 'pointer';
      part.addEventListener('click', () => {
        const currentNote = part.getAttribute('data-note') || '';
        document.getElementById('damagePart').textContent = part.getAttribute('data-part');
        document.getElementById('damageNote').value = currentNote;
        document.getElementById('saveDamageNote').onclick = () => {
          const note = document.getElementById('damageNote').value.trim();
          if (note) {
            part.setAttribute('data-note', note);
            part.setAttribute('fill', 'red');
          } else {
            part.removeAttribute('data-note');
            part.setAttribute('fill', 'white');
          }
          const modal = bootstrap.Modal.getInstance(document.getElementById('damageModal'));
          if (modal) modal.hide();
        };
        const modal = new bootstrap.Modal(document.getElementById('damageModal'));
        if (modal) modal.show();
      });
    });
  } else {
    console.error('No SVG parts found with class .car-part');
  }
}