document.addEventListener("DOMContentLoaded", () => {
  // --- CORE UI SELECTORS ---
  const filtersRow = document.getElementById("filters-row");
  const galleryGrid = document.getElementById("gallery-section");
  
  const imageModal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  
  const uploadModal = document.getElementById("upload-modal");
  const dropzone = document.getElementById("dropzone");
  const uploadInput = document.getElementById("upload-input");
  const submitUploadBtn = document.getElementById("submit-upload-btn");
  
  const videoModal = document.getElementById("video-modal");
  const previewVideo = document.getElementById("preview-video");

  let base64ImageBuffer = null;

  // --- PLATFORM MODAL CONTROL ENGINE ---
  function openModal(modal) {
    modal.classList.add("is-active");
  }

  function closeModal() {
    document.querySelectorAll(".custom-modal").forEach(m => m.classList.remove("is-active"));
    if (previewVideo) {
      previewVideo.pause();
      previewVideo.currentTime = 0;
    }
  }

  document.querySelectorAll(".modal-close-btn, .modal-backdrop").forEach(trigger => {
    trigger.addEventListener("click", closeModal);
  });

  // --- CORE CARD INTERACTIVES ENGINE ---
  function refreshCardClickListeners() {
    document.querySelectorAll(".gallery-item").forEach(item => {
      item.removeEventListener("click", handleCardOpening);
      item.addEventListener("click", handleCardOpening);
    });
  }

  function handleCardOpening(e) {
    const card = e.currentTarget;
    modalImage.src = card.querySelector("img").src;
    modalTitle.innerText = card.querySelector("h3").innerText;
    modalDescription.innerText = card.querySelector("p").innerText;
    openModal(imageModal);
  }

  // --- DYNAMIC RUNTIME CLASSIFICATION FILTERS ---
  function rebuildCategoryFilters() {
    const items = document.querySelectorAll(".gallery-item");
    let dynamicCategories = new Set();

    items.forEach(item => {
      const category = item.getAttribute("data-category");
      if (category) dynamicCategories.add(category.trim().toLowerCase());
    });

    // Clear dynamic old nodes tracking except structural "All" pill
    const nativePills = filtersRow.querySelectorAll("button:not([data-filter='all'])");
    nativePills.forEach(pill => pill.remove());

    dynamicCategories.forEach(cat => {
      const button = document.createElement("button");
      button.className = "filter-pill";
      button.setAttribute("data-filter", cat);
      button.innerText = cat;
      filtersRow.appendChild(button);
    });

    // Remap runtime tracking selectors across pill nodes
    filtersRow.querySelectorAll("button").forEach(pill => {
      pill.addEventListener("click", () => {
        filtersRow.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        pill.classList.add("active");
        executeGalleryLayoutFilter(pill.getAttribute("data-filter"));
      });
    });
  }

  function executeGalleryLayoutFilter(targetFilter) {
    const cards = document.querySelectorAll(".gallery-item");
    cards.forEach(card => {
      const itemCategory = card.getAttribute("data-category");
      if (targetFilter === "all" || itemCategory === targetFilter) {
        card.style.display = "block";
        setTimeout(() => { card.style.opacity = "1"; card.style.transform = "scale(1)"; }, 20);
      } else {
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        setTimeout(() => { card.style.display = "none"; }, 400);
      }
    });
  }

  // --- DRAG & DROP ZONE LOGIC ---
  dropzone.addEventListener("click", () => uploadInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-over");
  });

  ["dragleave", "dragend"].forEach(type => {
    dropzone.addEventListener(type, () => dropzone.classList.remove("drag-over"));
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) processFileToBuffer(file);
  });

  uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) processFileToBuffer(file);
  });

  function processFileToBuffer(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      base64ImageBuffer = e.target.result;
      dropzone.querySelector(".drop-text").innerHTML = `Asset captured: <span style="color: var(--accent-neon-cyan); font-weight:600;">${file.name}</span>`;
    };
    reader.readAsDataURL(file);
  }

  // --- ASSET PUBLISHING PIPELINE ---
  submitUploadBtn.addEventListener("click", () => {
    const title = document.getElementById("image-title").value.trim();
    const desc = document.getElementById("image-description").value.trim();
    const cat = document.getElementById("image-category").value.trim().toLowerCase();

    if (!base64ImageBuffer || !title || !desc || !cat) {
      alert("Please configure all input properties and load an image frame asset before injection.");
      return;
    }

    const newItem = document.createElement("div");
    newItem.className = "gallery-item";
    newItem.setAttribute("data-category", cat);
    newItem.innerHTML = `
      <div class="item-inner">
        <img src="${base64ImageBuffer}" alt="${title}">
        <div class="item-overlay">
          <span class="category-tag">${cat}</span>
          <h3>${title}</h3>
          <p>${desc}</p>
        </div>
      </div>
    `;

    galleryGrid.insertBefore(newItem, galleryGrid.firstChild);
    
    // Clear State & Close UI
    base64ImageBuffer = null;
    document.getElementById("image-title").value = "";
    document.getElementById("image-description").value = "";
    document.getElementById("image-category").value = "";
    dropzone.querySelector(".drop-text").innerHTML = 'Drag file here or <span class="highlight">Browse Assets</span>';
    
    rebuildCategoryFilters();
    refreshCardClickListeners();
    closeModal();
  });

  // --- STRUCTURAL BUTTON NAVIGATION ---
  document.getElementById("open-upload").addEventListener("click", () => openModal(uploadModal));
  document.getElementById("watch-preview").addEventListener("click", () => openModal(videoModal));
  
  document.querySelectorAll('.nav-link-item, #hero-explore').forEach(btn => {
    btn.addEventListener("click", (e) => {
      const href = btn.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
      } else if (btn.id === "hero-explore") {
        galleryGrid.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // --- INITIAL BUILD ENGINE BOOT ---
  rebuildCategoryFilters();
  refreshCardClickListeners();
});