import { auth, onAuthStateChanged, database, ref, get, child, update, getStorage, storageRef, uploadBytes, getDownloadURL, push, set } from './firebase-init.js';
import { generateSidebar, generateMobileSidebar } from './menu.js';

class VehicleFunctions {
  constructor() {
    this.dbPath = 'vehicles';
  }

  async createVehicle(data) {
    try {
      const user = auth.currentUser;
      console.log('Creating vehicle, user:', user ? user.uid : 'No user');
      if (!user) throw new Error('No user logged in');
      const newRef = push(ref(database, `users/${user.uid}/${this.dbPath}`));
      console.log('Pushing to database path:', `users/${user.uid}/${this.dbPath}`);
      await set(newRef, data);
      console.log('Vehicle created with ID:', newRef.key);
      return { id: newRef.key, ...data };
    } catch (error) {
      console.error('Error creating vehicle:', error.message);
      throw error;
    }
  }

  async fetchVehicle(vehicleId) {
    try {
      const user = auth.currentUser;
      console.log('Fetching vehicle, user:', user ? user.uid : 'No user');
      if (!user) throw new Error('No user logged in');
      const snapshot = await get(ref(database, `users/${user.uid}/${this.dbPath}/${vehicleId}`));
      console.log('Fetched snapshot exists:', snapshot.exists());
      if (!snapshot.exists()) throw new Error('Vehicle not found');
      return snapshot.val();
    } catch (error) {
      console.error('Error fetching vehicle:', error.message);
      throw error;
    }
  }

  validateFormData(data) {
    console.log('Validating form data:', data);
    return true; // No required fields
  }
}

const vehicleFunctions = new VehicleFunctions();

function showNotification(message) {
  const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
  document.getElementById('notificationMessage').textContent = message;
  modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('add_vehicle.js loaded');
  const sidebar = document.getElementById('sidebar');
  const mobileSidebar = document.getElementById('mobileSidebar');
  if (sidebar && mobileSidebar) {
    console.log('Generating sidebar and mobile sidebar');
    sidebar.innerHTML = generateSidebar();
    mobileSidebar.innerHTML = generateMobileSidebar();
  } else {
    console.error('Sidebar or mobileSidebar not found');
  }

  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed, user:', user ? user.uid : 'No user');
    if (!user) {
      window.location.href = 'login.html';
    }
  });

  let currentUpload = '';
  const sourceModal = document.getElementById('sourceSelectionModal');
  const modalInstance = new bootstrap.Modal(sourceModal);
  const documentsModal = new bootstrap.Modal(document.getElementById('documentsModal'));

  const uploadProfileImage = document.getElementById('uploadProfileImage');
  if (uploadProfileImage) {
    console.log('Setting up uploadProfileImage event listener');
    uploadProfileImage.addEventListener('click', () => {
      console.log('uploadProfileImage clicked, setting currentUpload to profile');
      currentUpload = 'profile';
      modalInstance.show();
    });
  } else {
    console.error('uploadProfileImage button not found');
  }

  const uploadImages = document.getElementById('uploadImages');
  if (uploadImages) {
    console.log('Setting up uploadImages event listener');
    uploadImages.addEventListener('click', () => {
      console.log('uploadImages clicked, setting currentUpload to images');
      currentUpload = 'images';
      modalInstance.show();
    });
  } else {
    console.error('uploadImages button not found');
  }

  const uploadDocuments = document.getElementById('uploadDocuments');
  if (uploadDocuments) {
    console.log('Setting up uploadDocuments event listener');
    uploadDocuments.addEventListener('click', () => {
      console.log('uploadDocuments clicked, setting currentUpload to documents');
      currentUpload = 'documents';
      modalInstance.show();
    });
  } else {
    console.error('uploadDocuments button not found');
  }

  const viewDocuments = document.getElementById('viewDocuments');
  if (viewDocuments) {
    console.log('Setting up viewDocuments event listener');
    viewDocuments.addEventListener('click', () => {
      const documentsPreview = document.getElementById('documents-preview-container');
      const documentsList = document.getElementById('documentsList');
      if (documentsPreview && documentsList) {
        console.log('Preparing to display documents');
        documentsList.innerHTML = '';
        const docUrls = Array.from(documentsPreview.querySelectorAll('img')).map(img => img.src);
        docUrls.forEach((url, index) => {
          const fileName = url.split('/').pop();
          const col = document.createElement('div');
          col.className = 'col-md-4 mb-3';
          col.innerHTML = `<p>${fileName}</p><img src="${url}" alt="Document" style="max-width: 100px; cursor: pointer;" onclick="this.requestFullscreen();" ondblclick="window.open('${url}', '_blank');">`;
          documentsList.appendChild(col);
        });
      } else {
        console.error('documentsPreview or documentsList not found');
      }
      documentsModal.show();
    });
  } else {
    console.error('viewDocuments button not found');
  }

  const useCamera = document.getElementById('useCamera');
  if (useCamera) {
    console.log('Setting up useCamera event listener');
    useCamera.addEventListener('click', () => {
      console.log('useCamera clicked, currentUpload:', currentUpload);
      if (currentUpload === 'profile') document.getElementById('profileCameraInput').click();
      if (currentUpload === 'images') document.getElementById('cameraInput').click();
      if (currentUpload === 'documents') document.getElementById('documentsInput').click();
      modalInstance.hide();
      showNotification('Image captured successfully!');
    });
  } else {
    console.error('useCamera button not found');
  }

  const useGallery = document.getElementById('useGallery');
  if (useGallery) {
    console.log('Setting up useGallery event listener');
    useGallery.addEventListener('click', () => {
      console.log('useGallery clicked, currentUpload:', currentUpload);
      if (currentUpload === 'profile') document.getElementById('profileImageInput').click();
      if (currentUpload === 'images') document.getElementById('imageInput').click();
      if (currentUpload === 'documents') document.getElementById('documentsInput').click();
      modalInstance.hide();
      showNotification('Image selected from gallery!');
    });
  } else {
    console.error('useGallery button not found');
  }

  let currentImageIndex = 0;
  const images = [];
  const handleProfileFiles = (files) => {
    console.log('Handling profile files, count:', files.length);
    images.length = 0;
    images.push(...Array.from(files));
    updateImagePreview();
    showNotification(`${files.length} profile image(s) uploaded!`);
  };

  function updateImagePreview() {
    console.log('Updating image preview, currentImageIndex:', currentImageIndex, 'images length:', images.length);
    const mainPreview = document.getElementById('mainImagePreview');
    const thumbnailPreview = document.getElementById('thumbnail-preview');
    const nextImageBtn = document.getElementById('nextImage');
    const prevImageBtn = document.getElementById('prevImage'); // Assuming you add this button
    if (mainPreview && thumbnailPreview && nextImageBtn && prevImageBtn) {
      if (images.length > 0) {
        mainPreview.src = URL.createObjectURL(images[currentImageIndex]);
        thumbnailPreview.innerHTML = images.map((img, idx) => `<img src="${URL.createObjectURL(img)}" alt="Thumbnail" style="max-width: 100px; max-height: 100px; cursor: pointer;" onclick="currentImageIndex=${idx}; updateImagePreview();">`).join('');
        nextImageBtn.style.display = images.length > 1 ? 'inline-block' : 'none';
        prevImageBtn.style.display = images.length > 1 ? 'inline-block' : 'none';
      } else {
        mainPreview.src = 'https://placehold.co/600x400';
        thumbnailPreview.innerHTML = '';
        nextImageBtn.style.display = 'none';
        prevImageBtn.style.display = 'none';
      }
    } else {
      console.error('Preview elements not found');
    }
  }

  // Add prevImage button dynamically if not present
  if (!document.getElementById('prevImage')) {
    const prevButton = document.createElement('button');
    prevButton.id = 'prevImage';
    prevButton.className = 'btn btn-sm btn-secondary mt-2 me-2';
    prevButton.textContent = 'Previous';
    prevButton.style.display = 'none';
    document.querySelector('.gallery-preview').appendChild(prevButton);
    prevButton.addEventListener('click', () => {
      if (images.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateImagePreview();
      }
    });
  }

  document.getElementById('profileImageInput').addEventListener('change', (e) => handleProfileFiles(e.target.files));
  document.getElementById('profileCameraInput').addEventListener('change', (e) => handleProfileFiles(e.target.files));

  document.getElementById('nextImage').addEventListener('click', () => {
    console.log('Next image button clicked');
    if (images.length > 0) {
      currentImageIndex = (currentImageIndex + 1) % images.length;
      updateImagePreview();
    }
  });

  const handleImagesFiles = (files) => {
    console.log('Handling images files, count:', files.length);
    const preview = document.getElementById('preview-container');
    if (preview) {
      preview.innerHTML = '';
      Array.from(files).forEach((file) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '100px';
        img.style.margin = '5px';
        preview.appendChild(img);
      });
      showNotification(`${files.length} image(s) uploaded!`);
    } else {
      console.error('preview-container not found');
    }
  };

  document.getElementById('imageInput').addEventListener('change', (e) => handleImagesFiles(e.target.files));
  document.getElementById('cameraInput').addEventListener('change', (e) => handleImagesFiles(e.target.files));

  const scanPlateIcon = document.querySelector('#registration + .input-group-text i.fas.fa-camera');
  if (scanPlateIcon) {
    console.log('Setting up scanPlate event listener');
    scanPlateIcon.addEventListener('click', () => {
      const plateInput = document.createElement('input');
      plateInput.type = 'file';
      plateInput.accept = 'image/*';
      plateInput.capture = 'environment';
      plateInput.style.display = 'none';
      document.body.appendChild(plateInput);
      plateInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log('Scanning plate image:', file.name);
          const worker = await Tesseract.createWorker('eng');
          const { data: { text } } = await worker.recognize(file);
          document.getElementById('registration').value = text.trim();
          console.log('Plate recognized:', text.trim());
          await worker.terminate();
        }
        document.body.removeChild(plateInput);
      });
      plateInput.click();
    });
  } else {
    console.warn('Scan plate icon not found – adding camera icon dynamically');
    const registrationInput = document.getElementById('registration');
    if (registrationInput) {
      const inputGroup = registrationInput.closest('.input-group');
      if (inputGroup) {
        const cameraIcon = document.createElement('span');
        cameraIcon.className = 'input-group-text';
        cameraIcon.innerHTML = '<i class="fas fa-camera" style="cursor: pointer;"></i>';
        inputGroup.appendChild(cameraIcon);
        cameraIcon.addEventListener('click', () => {
          const plateInput = document.createElement('input');
          plateInput.type = 'file';
          plateInput.accept = 'image/*';
          plateInput.capture = 'environment';
          plateInput.style.display = 'none';
          document.body.appendChild(plateInput);
          plateInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
              console.log('Scanning plate image:', file.name);
              const worker = await Tesseract.createWorker('eng');
              const { data: { text } } = await worker.recognize(file);
              document.getElementById('registration').value = text.trim();
              console.log('Plate recognized:', text.trim());
              await worker.terminate();
            }
            document.body.removeChild(plateInput);
          });
          plateInput.click();
        });
      } else {
        console.error('input-group not found for registration');
      }
    } else {
      console.error('registration input not found');
    }
  }

  document.getElementById('recognizeCar').addEventListener('click', () => {
    document.getElementById('carImageInput').click();
  });

  document.getElementById('carImageInput').addEventListener('change', () => {
    console.log('Car image selected, recognition not implemented');
    showNotification('Car recognition not implemented!');
  });

  document.getElementById('video').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('video-preview');
    if (preview) {
      console.log('Video file selected:', file.name);
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    } else {
      console.error('video-preview not found');
    }
  });

  document.getElementById('documentsInput').addEventListener('change', (e) => {
    const files = e.target.files;
    const preview = document.getElementById('documents-preview-container');
    if (preview) {
      console.log('Processing documents, count:', files.length);
      preview.innerHTML = '';
      preview.style.display = 'block';
      Array.from(files).forEach((file) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '100px';
        img.style.margin = '5px';
        preview.appendChild(img);
      });
      showNotification(`${files.length} document(s) uploaded!`);
    } else {
      console.error('documents-preview-container not found');
    }
  });

  const saveVehicle = document.getElementById('saveVehicle');
  if (saveVehicle) {
    saveVehicle.addEventListener('click', async () => {
      console.log('Save vehicle button clicked');
      const data = {
        vin: document.getElementById('vin').value || '',
        make: document.getElementById('make').value || '',
        model: document.getElementById('model').value || '',
        finish: document.getElementById('finish').value || '',
        registration: document.getElementById('registration').value || '',
        energy: document.getElementById('energy').value || '',
        firstProduced: document.getElementById('firstProduced').value || '',
        mileage: document.getElementById('mileage').value || '',
        serialNumber: document.getElementById('serialNumber').value || '',
        colour: document.getElementById('colour').value || '',
        recoverable: document.getElementById('recoverable').value || '',
        type: document.getElementById('type').value || '',
        bodywork: document.getElementById('bodywork').value || '',
        storageLocation: document.getElementById('storageLocation').value || '',
        co2: document.getElementById('co2').value || '',
        engineCapacity: document.getElementById('engineCapacity').value || '',
        gearbox: document.getElementById('gearbox').value || '',
        purchasePrice: document.getElementById('purchasePrice').value || '',
        vat: document.getElementById('vat').value || '',
        newImport: document.getElementById('newImport').value || '',
        importCountry: document.getElementById('importCountry').value || '',
        registrationNumber: document.getElementById('registrationNumber').value || '',
        purchasedDate: document.getElementById('purchasedDate').value || '',
        comments: document.getElementById('comments').value || '',
        damages: {}
      };

      if (!vehicleFunctions.validateFormData(data)) {
        console.log('Validation failed, showing alert');
        showNotification('Please fill out required fields'); // Optional message
        return;
      }

      const storage = getStorage();
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user');
        return;
      }
      console.log('Authenticated user:', user.uid);
      const newRef = push(ref(database, `users/${user.uid}/vehicles`));
      const vehicleId = newRef.key;
      console.log('Generated vehicle ID:', vehicleId);

      let profileUrls = [];
      const profileFiles = [...(document.getElementById('profileImageInput').files || []), ...(document.getElementById('profileCameraInput').files || [])];
      if (profileFiles.length > 0) {
        console.log('Uploading profile images, count:', profileFiles.length);
        for (let file of profileFiles) {
          const profileRef = storageRef(storage, `vehicles/${vehicleId}/profile/${file.name}`);
          await uploadBytes(profileRef, file);
          const url = await getDownloadURL(profileRef);
          console.log('Uploaded profile image, URL:', url);
          profileUrls.push(url);
        }
      }
      data.profile_images = profileUrls;

      let documentUrls = [];
      const documentFiles = document.getElementById('documentsInput').files;
      if (documentFiles && documentFiles.length > 0) {
        console.log('Uploading documents, count:', documentFiles.length);
        for (let file of documentFiles) {
          const docRef = storageRef(storage, `vehicles/${vehicleId}/documents/${file.name}`);
          await uploadBytes(docRef, file);
          const url = await getDownloadURL(docRef);
          console.log('Uploaded document, URL:', url);
          documentUrls.push(url);
        }
      }
      data.documents = documentUrls;

      let imageUrls = [];
      const imageFiles = [...(document.getElementById('imageInput').files || []), ...(document.getElementById('cameraInput').files || [])];
      if (imageFiles.length > 0) {
        console.log('Uploading images, count:', imageFiles.length);
        for (let file of imageFiles) {
          const imgRef = storageRef(storage, `vehicles/${vehicleId}/images/${file.name}`);
          await uploadBytes(imgRef, file);
          const url = await getDownloadURL(imgRef);
          console.log('Uploaded image, URL:', url);
          imageUrls.push(url);
        }
      }
      data.images = imageUrls;

      let videoUrl = '';
      const videoFile = document.getElementById('video').files[0];
      if (videoFile) {
        console.log('Uploading video:', videoFile.name);
        const videoRef = storageRef(storage, `vehicles/${vehicleId}/video.mp4`);
        await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(videoRef);
        console.log('Uploaded video, URL:', videoUrl);
      }
      data.video = videoUrl;

      try {
        console.log('Attempting to create vehicle with data:', data);
        await vehicleFunctions.createVehicle(data);
        console.log('Vehicle creation successful, resetting form');
        showNotification('Vehicle created successfully!');
        const form = document.getElementById('addForm');
        if (form) form.reset();
        else console.error('addForm not found');
        document.getElementById('mainImagePreview').src = 'https://placehold.co/600x400';
        document.getElementById('thumbnail-preview').innerHTML = '';
        document.getElementById('preview-container').innerHTML = '';
        document.getElementById('documents-preview-container').innerHTML = '';
        document.getElementById('documents-preview-container').style.display = 'none';
        document.getElementById('video-preview').style.display = 'none';
      } catch (error) {
        console.error('Error saving vehicle:', error.message);
        showNotification('Error creating vehicle: ' + error.message);
      }
    });
  } else {
    console.error('saveVehicle button not found');
  }

  // Dynamic model selection based on make
  const makeSelect = document.getElementById('make');
  const modelSelect = document.getElementById('model');
  if (makeSelect && modelSelect) {
    console.log('Setting up dynamic model selection');
    const models = {
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

    makeSelect.addEventListener('change', () => {
      console.log('Make changed to:', makeSelect.value);
      const selectedMake = makeSelect.value;
      modelSelect.innerHTML = '<option value="">Select Model</option>';
      if (selectedMake && models[selectedMake]) {
        models[selectedMake].forEach(model => {
          const option = document.createElement('option');
          option.value = model;
          option.textContent = model;
          modelSelect.appendChild(option);
        });
      } else {
        console.log('No models available for:', selectedMake);
      }
    });
  } else {
    console.error('make or model select not found');
  }

  // SVG model loading
  function getBrandSvgModel(brand) {
    console.log('Getting SVG model for brand:', brand);
    const brandSvgMap = {
      'mercedes-benz': 'img/models/sedan.svg',
      'bmw': 'img/models/sedan.svg',
      'audi': 'img/models/sedan.svg',
      'renault': 'img/models/sedan.svg',
      'peugeot': 'img/models/sedan.svg'
    };
    return brandSvgMap[brand?.toLowerCase()] || 'img/models/sedan.svg';
  }

  makeSelect.addEventListener('change', () => {
    const svgContainer = document.getElementById('damagesSchema');
    if (svgContainer) {
      console.log('Loading SVG for:', makeSelect.value);
      const svgPath = getBrandSvgModel(makeSelect.value);
      fetch(svgPath)
        .then(res => res.text())
        .then(svg => {
          console.log('SVG loaded successfully');
          svgContainer.innerHTML = svg;
        })
        .catch(err => {
          console.error('Failed to load SVG model:', err);
          svgContainer.innerHTML = '<p>SVG model not available</p>';
        });
    } else {
      console.error('damagesSchema not found');
    }
  });
});