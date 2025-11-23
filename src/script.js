let albums = [];

// Observer to pause off-screen videos in the list view for performance
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.play().catch(() => {}); // Try to play
        } else {
            entry.target.pause();
        }
    });
}, { threshold: 0.25 });

// 1. Load Data
// Note: pointing to src/albums.json relative to index.html
fetch('src/albums.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load albums');
    return res.json();
  })
  .then(data => {
    albums = data;
    document.getElementById('loader').style.display = 'none';
    renderAlbumCards();
  })
  .catch(err => {
    console.error(err);
    document.getElementById('loader').textContent = 'Error loading albums.';
  });

// 2. Helper: Create Media
function createMediaElement(src, type = 'image', alt = '') {
  if (type === 'video') {
    const video = document.createElement('video');
    video.src = src;
    video.muted = true; // Required for autoplay
    video.loop = true;
    video.playsInline = true; // Required for iOS
    return video;
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || 'Media';
    img.loading = "lazy"; // PERFORMANCE: Lazy load images
    return img;
  }
}

// 3. Render Album List
function renderAlbumCards() {
  const list = document.getElementById('album-list');
  // Use Fragment for performance (1 reflow instead of many)
  const fragment = document.createDocumentFragment();

  albums.forEach((album, index) => {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.onclick = () => openAlbum(index);

    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'thumbnail-container';

    // Determine thumbnail source
    const thumbSrc = album.thumbnail || (album.items.length ? album.items[0].src : '');
    const isVideo = thumbSrc.endsWith('.mp4');
    
    const mediaEl = createMediaElement(thumbSrc, isVideo ? 'video' : 'image', album.title);
    
    // Optimization: Only observe videos in list view
    if (isVideo) {
        mediaEl.autoplay = false; // Let observer handle it
        videoObserver.observe(mediaEl);
    }

    thumbContainer.appendChild(mediaEl);
    card.appendChild(thumbContainer);

    const title = document.createElement('h3');
    title.textContent = album.title;
    card.appendChild(title);

    fragment.appendChild(card);
  });

  list.appendChild(fragment);
}

// 4. Open Album View
function openAlbum(index) {
  const currentAlbum = albums[index];
  const listSection = document.getElementById('album-list');
  const viewSection = document.getElementById('album-view');
  
  // Toggle Visibility
  listSection.style.display = 'none';
  viewSection.classList.add('visible');
  window.scrollTo(0,0); // Reset scroll

  // Set Title
  document.getElementById('album-title').textContent = currentAlbum.title;

  // Set Audio
  const narration = document.getElementById('narration');
  if (currentAlbum.narration) {
      narration.src = currentAlbum.narration;
      narration.style.display = 'block';
      // narration.play(); // Optional: Auto-play audio
  } else {
      narration.style.display = 'none';
      narration.pause();
  }

  // Render Content
  const container = document.getElementById('media-container');
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  currentAlbum.items.forEach(item => {
    const type = item.type || 'image';
    const el = createMediaElement(item.src, type, currentAlbum.title);
    
    if (type === 'video') {
      el.controls = true; // Controls needed for main view
      el.autoplay = true;
    }

    fragment.appendChild(el);

    if (item.caption) {
      const caption = document.createElement('div');
      caption.className = 'caption';
      caption.innerHTML = item.caption.replace(/\n/g, '<br>');
      fragment.appendChild(caption);
    }
  });

  container.appendChild(fragment);
}

// 5. Back Navigation
function goBack() {
  document.getElementById('album-list').style.display = 'grid';
  document.getElementById('album-view').classList.remove('visible');

  // Stop Audio
  const narration = document.getElementById('narration');
  narration.pause();
  narration.src = '';
  
  // Clear media to save memory
  document.getElementById('media-container').innerHTML = '';
}

// Attach Listeners to all back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', goBack);
});
