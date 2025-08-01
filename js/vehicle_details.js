import { auth, onAuthStateChanged, database, ref, get, child, update, getStorage, storageRef, uploadBytes, getDownloadURL } from './firebase-init.js';
import { generateSidebar, generateMobileSidebar } from './menu.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('vehicle_details.js loaded');
  const sidebar = document.getElementById('sidebar');
  const mobileSidebar = document.getElementById('mobileSidebar');
  if (sidebar && mobileSidebar) {
    sidebar.innerHTML = generateSidebar();
    mobileSidebar.innerHTML = generateMobileSidebar();
  } else {
    console.error('Sidebar or mobileSidebar not found');
  }

  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('id');
  console.log('Vehicle ID from URL:', vehicleId);

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      loadVehicleDetails(user.uid, vehicleId);
    }
  });

  const openSchema = document.getElementById('openSchema');
  if (openSchema) {
    openSchema.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('schemaModal'));
      modal.show();
    });
  }

  const openGallery = document.getElementById('openGallery');
  if (openGallery) {
    openGallery.addEventListener('click', () => {
      const gallerySection = document.getElementById('gallerySection');
      if (gallerySection) gallerySection.style.display = 'block';
    });
  }

  const openDocuments = document.getElementById('openDocuments');
  if (openDocuments) {
    openDocuments.addEventListener('click', () => {
      const documentsSection = document.getElementById('documentsSection');
      if (documentsSection) documentsSection.style.display = 'block';
    });
  }

  const uploadGalleryImage = document.getElementById('uploadGalleryImage');
  if (uploadGalleryImage) {
    uploadGalleryImage.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('sourceSelectionModal'));
      modal.show();
    });
  }

  const uploadDocument = document.getElementById('uploadDocument');
  if (uploadDocument) {
    uploadDocument.addEventListener('click', () => {
      document.getElementById('documentInput').click();
    });
  }

  const useCamera = document.getElementById('useCamera');
  if (useCamera) {
    useCamera.addEventListener('click', () => {
      document.getElementById('galleryCameraInput').click();
    });
  }

  const useGalleryBtn = document.getElementById('useGallery');
  if (useGalleryBtn) {
    useGalleryBtn.addEventListener('click', () => {
      document.getElementById('galleryImageInput').click();
    });
  }

  const handleGalleryFiles = async (files) => {
    const storage = getStorage();
    const preview = document.getElementById('gallery-preview-container');
    if (preview) preview.innerHTML = '';
    const urls = [];
    for (let file of files) {
      const fileRef = storageRef(storage, `vehicles/${vehicleId}/gallery/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      urls.push(url);
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100px';
      img.style.margin = '5px';
      preview.appendChild(img);
    }
    await update(ref(database, `users/${auth.currentUser.uid}/vehicles/${vehicleId}`), { gallery: urls });
  };

  const handleDocumentFiles = async (files) => {
    const storage = getStorage();
    const preview = document.getElementById('documents-preview-container');
    if (preview) preview.innerHTML = '';
    const urls = [];
    for (let file of files) {
      const fileRef = storageRef(storage, `vehicles/${vehicleId}/documents/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      urls.push(url);
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100px';
      img.style.margin = '5px';
      preview.appendChild(img);
    }
    await update(ref(database, `users/${auth.currentUser.uid}/vehicles/${vehicleId}`), { documents: urls });
  };

  document.getElementById('galleryImageInput').addEventListener('change', (e) => handleGalleryFiles(e.target.files));
  document.getElementById('galleryCameraInput').addEventListener('change', (e) => handleGalleryFiles(e.target.files));
  document.getElementById('documentInput').addEventListener('change', (e) => handleDocumentFiles(e.target.files));

  const editWithAI = document.getElementById('editWithAI');
  if (editWithAI) {
    editWithAI.addEventListener('click', () => {
      alert('AI editing in progress...');
    });
  }

  const generateVideo = document.getElementById('generateVideo');
  if (generateVideo) {
    generateVideo.addEventListener('click', () => {
      alert('Video generation in progress...');
    });
  }

  const updateVehicle = document.getElementById('updateVehicle');
  if (updateVehicle) {
    updateVehicle.addEventListener('click', async () => {
      const newStatus = document.getElementById('vehicleStatus').value;
      await update(ref(database, `users/${auth.currentUser.uid}/vehicles/${vehicleId}`), { status: newStatus });
      alert('Status updated!');
      loadVehicleDetails(auth.currentUser.uid, vehicleId);
    });
  }

  const schemaParts = document.querySelectorAll('.car-schema circle');
  if (schemaParts.length > 0) {
    schemaParts.forEach(part => {
      part.addEventListener('click', () => {
        const noteSection = document.getElementById('noteSection');
        if (noteSection) noteSection.style.display = 'block';
        const saveNote = document.getElementById('saveNote');
        if (saveNote) {
          saveNote.addEventListener('click', async () => {
            const note = document.getElementById('noteText').value;
            const noteImage = document.getElementById('noteImage').files[0];
            let imageUrl = '';
            if (noteImage) {
              const storage = getStorage();
              const fileRef = storageRef(storage, `users/${auth.currentUser.uid}/vehicles/${vehicleId}/damages/${part.id}/${noteImage.name}`);
              await uploadBytes(fileRef, noteImage);
              imageUrl = await getDownloadURL(fileRef);
            }
            await update(ref(database, `users/${auth.currentUser.uid}/vehicles/${vehicleId}/damages/${part.id}`), { note, image: imageUrl });
            if (noteSection) noteSection.style.display = 'none';
            loadVehicleDetails(auth.currentUser.uid, vehicleId);
          }, { once: true });
        }
      });
    });
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

  function loadVehicleDetails(userId, vehicleId) {
    console.log('Loading vehicle details for user ID:', userId, 'vehicle ID:', vehicleId);
    const dbRef = ref(database);
    get(child(dbRef, `users/${userId}/vehicles/${vehicleId}`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log('Vehicle data found:', snapshot.val());
        const vehicle = snapshot.val();
        const mainImage = document.getElementById('mainImage');
        const galleryPreview = document.getElementById('gallery-preview');
        const prevImageBtn = document.getElementById('prevImage');
        const nextImageBtn = document.getElementById('nextImage');
        if (mainImage && galleryPreview && prevImageBtn && nextImageBtn) {
          const images = vehicle.images || [];
          let currentIndex = 0;
          mainImage.src = images[0] || 'https://placehold.co/600x400';
          galleryPreview.innerHTML = images.map((img, idx) => `<img src="${img}" alt="Gallery Image" class="img-thumbnail" style="max-width: 100px; cursor: pointer;" onclick="updateGalleryPreview(images, ${idx});">`).join('');
          prevImageBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateGalleryPreview(images, currentIndex);
          });
          nextImageBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateGalleryPreview(images, currentIndex);
          });
        } else {
          console.error('Gallery elements not found');
        }
        const quickVin = document.getElementById('quickVin');
        const quickEnergy = document.getElementById('quickEnergy');
        const quickFirstProduced = document.getElementById('quickFirstProduced');
        const quickMileage = document.getElementById('quickMileage');
        const quickRecoverableVAT = document.getElementById('quickRecoverableVAT');
        const quickType = document.getElementById('quickType');
        const quickStorage = document.getElementById('quickStorage');
        const quickPurchasePrice = document.getElementById('quickPurchasePrice');
        const quickVAT = document.getElementById('quickVAT');
        const quickNewImport = document.getElementById('quickNewImport');
        const quickImportCountry = document.getElementById('quickImportCountry');
        const quickRegistration = document.getElementById('quickRegistration');
        const quickPurchasedDate = document.getElementById('quickPurchasedDate');
        if (quickVin && quickEnergy && quickFirstProduced && quickMileage && quickRecoverableVAT && quickType && quickStorage && quickPurchasePrice && quickVAT && quickNewImport && quickImportCountry && quickRegistration && quickPurchasedDate) {
          quickVin.textContent = vehicle.vin || 'N/A';
          quickEnergy.textContent = vehicle.energy || 'N/A';
          quickFirstProduced.textContent = vehicle.firstProduced || 'N/A';
          quickMileage.textContent = vehicle.mileage || 'N/A';
          quickRecoverableVAT.textContent = vehicle.recoverable || 'N/A';
          quickType.textContent = vehicle.type || 'N/A';
          quickStorage.textContent = vehicle.storageLocation || 'N/A';
          quickPurchasePrice.textContent = vehicle.purchasePrice || 'N/A';
          quickVAT.textContent = vehicle.vat || 'N/A';
          quickNewImport.textContent = vehicle.newImport || 'N/A';
          quickImportCountry.textContent = vehicle.importCountry || 'N/A';
          quickRegistration.textContent = vehicle.registration || 'N/A';
          quickPurchasedDate.textContent = vehicle.purchasedDate || 'N/A';
        } else {
          console.error('Quick Info elements not found');
        }
        const documentsPreview = document.getElementById('documents-preview-container');
        if (documentsPreview && vehicle.documents) {
          documentsPreview.innerHTML = vehicle.documents.map(doc => `<img src="${doc}" alt="Document" style="max-width:100px; margin:5px;">`).join('');
        }
        const characteristicsContent = document.getElementById('characteristicsContent');
        if (characteristicsContent) {
          characteristicsContent.innerHTML = `
            <tr><td>VIN</td><td>${vehicle.vin || 'N/A'}</td></tr>
            <tr><td>Make</td><td>${vehicle.make || 'N/A'}</td></tr>
            <tr><td>Model</td><td>${vehicle.model || 'N/A'}</td></tr>
            <tr><td>Finish</td><td>${vehicle.finish || 'N/A'}</td></tr>
            <tr><td>Registration</td><td>${vehicle.registration || 'N/A'}</td></tr>
            <tr><td>Energy</td><td>${vehicle.energy || 'N/A'}</td></tr>
            <tr><td>First Produced</td><td>${vehicle.firstProduced || 'N/A'}</td></tr>
            <tr><td>Mileage</td><td>${vehicle.mileage || 'N/A'} KM</td></tr>
            <tr><td>Serial Number</td><td>${vehicle.serialNumber || 'N/A'}</td></tr>
            <tr><td>Colour</td><td>${vehicle.colour || 'N/A'}</td></tr>
            <tr><td>Recoverable VAT</td><td>${vehicle.recoverable || 'N/A'}</td></tr>
            <tr><td>Type</td><td>${vehicle.type || 'N/A'}</td></tr>
            <tr><td>Bodywork</td><td>${vehicle.bodywork || 'N/A'}</td></tr>
            <tr><td>Storage Location</td><td>${vehicle.storageLocation || 'N/A'}</td></tr>
            <tr><td>CO2</td><td>${vehicle.co2 || 'N/A'}</td></tr>
            <tr><td>Engine Capacity</td><td>${vehicle.engineCapacity || 'N/A'}</td></tr>
            <tr><td>Gearbox</td><td>${vehicle.gearbox || 'N/A'}</td></tr>
          `;
        }
        const commentsContent = document.getElementById('commentsContent');
        if (commentsContent) {
          commentsContent.textContent = vehicle.comments || 'No comments available.';
        }
        const vehicleStatus = document.getElementById('vehicleStatus');
        if (vehicleStatus) {
          vehicleStatus.value = vehicle.status || 'In Preparation';
        }
        const damagesSchema = document.getElementById('damagesSchema');
        if (damagesSchema) {
          loadSvgSchema(vehicle.make, damagesSchema);
        }
      } else {
        console.log('No vehicle found for ID:', vehicleId);
      }
    }).catch((error) => {
      console.error('Error loading vehicle details:', error.message);
    });
  }

  function updateGalleryPreview(images, index) {
    const mainImage = document.getElementById('mainImage');
    const galleryPreview = document.getElementById('gallery-preview');
    const prevImageBtn = document.getElementById('prevImage');
    const nextImageBtn = document.getElementById('nextImage');
    if (mainImage && galleryPreview && prevImageBtn && nextImageBtn) {
      mainImage.src = images[index] || 'https://placehold.co/600x400';
      galleryPreview.innerHTML = images.map((img, idx) => `<img src="${img}" alt="Gallery Image" class="img-thumbnail" style="max-width: 100px; cursor: pointer;" onclick="updateGalleryPreview(images, ${idx});">`).join('');
      prevImageBtn.style.display = images.length > 1 ? 'inline-block' : 'none';
      nextImageBtn.style.display = images.length > 1 ? 'inline-block' : 'none';
    } else {
      console.error('Gallery elements not found');
    }
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
          document.getElementById('damagePart').textContent = part.getAttribute('data-part') || part.getAttribute('id');
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

  function loadSvgSchema(brand, container) {
    console.log('Loading SVG schema for brand:', brand);
    const svgPath = getBrandSvgModel(brand);
    fetch(svgPath)
      .then(res => res.text())
      .then(svg => {
        console.log('SVG loaded successfully');
        container.innerHTML = svg;
        enablePopupForSvgParts();
      })
      .catch(err => {
        console.error('Failed to load SVG schema:', err);
        container.innerHTML = '<p>SVG schema not available</p>';
      });
  }

  function getBrandSvgModel(brand) {
    const brandSvgMap = {
      'mercedes-benz': 'img/models/sedan.svg',
      'bmw': 'img/models/sedan.svg',
      'audi': 'img/models/sedan.svg',
      'renault': 'img/models/sedan.svg',
      'peugeot': 'img/models/sedan.svg'
    };
    return brandSvgMap[brand?.toLowerCase()] || 'img/models/sedan.svg';
  }
});