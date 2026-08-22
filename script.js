// app.js
// ---------------------------
// Leaflet map + UI interactions
// ---------------------------

document.addEventListener('DOMContentLoaded', () => {
  // --------
  // 1. Initialize Leaflet Map
  // --------
  let map;
  try {
    map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([16.9, 81.8], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
  } catch (err) {
    // If Leaflet or the map container isn't available, fail gracefully
    console.warn('Leaflet map could not be initialized:', err);
  }

  // --------
  // 2. Define Real Plot Coordinates
  // --------
  const locations = {
    airport: [
      { name: "Airport Plot A", lat: 16.8873, lng: 81.8221, desc: "Burugupudi, beside Dwaraka Mahal Function Hall" },
      { name: "Airport Plot B", lat: 16.8839, lng: 81.8194, desc: "Madhurapudi, near Airport" }
    ],
    korukonda: [
      { name: "Korukonda Plot A", lat: 17.0334, lng: 81.7962, desc: "Gated layout with 40ft roads" },
      { name: "Korukonda Plot B", lat: 17.0289, lng: 81.7901, desc: "Green peaceful area" }
    ],
    srirangapatnam: [
      { name: "Srirangapatnam Plot A", lat: 12.418, lng: 76.692, desc: "Close to temples and main road" },
      { name: "Srirangapatnam Plot B", lat: 12.419, lng: 76.695, desc: "Ready-to-build land" }
    ]
  };

  // --------
  // 3. Add Markers and Popups (if map exists)
  // --------
  if (map && typeof L !== 'undefined') {
    Object.entries(locations).forEach(([region, plots]) => {
      plots.forEach(plot => {
        const marker = L.marker([plot.lat, plot.lng]).addTo(map);
        // Use CSS class for styling popups instead of inline styles where possible.
        marker.bindPopup(`
          <div class="map-popup" style="min-width:180px">
            <strong>${escapeHtml(plot.name)}</strong><br>
            ${escapeHtml(plot.desc)}<br>
            <a href="#${region}" class="map-link">View Details</a>
          </div>
        `);
      });
    });
  }

  // --------
  // 4. Focus Map on Region When Navbar Clicked
  // --------
  const focusArea = {
    airport: [16.887, 81.822, 13],
    korukonda: [17.03, 81.79, 13],
    srirangapatnam: [12.419, 76.694, 13]
  };

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      // ignore external links
      if (!href.startsWith('#')) return;
      const id = href.replace('#', '');
      if (focusArea[id] && map && typeof map.flyTo === 'function') {
        const [lat, lng, zoom] = focusArea[id];
        map.flyTo([lat, lng], zoom, { animate: true, duration: 1.2 });
      }
      // allow the anchor to work as normal (scroll to section)
    });
  });

  // --------
  // 5. Video Modal (robust & accessible)
  // --------
  const modal = document.getElementById('videoModal');
  const openBtn = document.getElementById('openVideo');
  // Support both ".modal-close" and legacy ".close" buttons
  const closeBtn = modal?.querySelector('.modal-close') || modal?.querySelector('.close');

  function openModal() {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    // set focus to the close button for keyboard users if available
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    // return focus to the opening button if present
    if (openBtn) openBtn.focus();
    // stop any playing video: pause and reset time
    const vid = modal.querySelector('video');
    if (vid && typeof vid.pause === 'function') {
      vid.pause();
      vid.currentTime = 0;
    }
  }

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // close when clicking outside modal content
  window.addEventListener('click', (event) => {
    if (!modal) return;
    if (event.target === modal) closeModal();
  });

  // close on ESC key
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeModal();
    }
  });

  // --------
  // 6. Simple form handler (graceful)
  // --------
  const inquiryForm = document.getElementById('inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // basic validation / collect data
      const data = new FormData(inquiryForm);
      const payload = {
        name: data.get('name') || '',
        email: data.get('email') || '',
        phone: data.get('phone') || '',
        location: data.get('location') || '',
        message: data.get('message') || ''
      };

      // TODO: integrate with backend or mail service. For now show a friendly message.
      console.log('Inquiry submitted:', payload);
      alert('Thanks! Your inquiry has been received. We will contact you soon.');
      inquiryForm.reset();
    });
  }

  // --------
  // Utility: simple HTML escaping for popup content
  // --------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});