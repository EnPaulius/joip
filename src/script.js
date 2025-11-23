let albums = [];

// Observer to pause off-screen videos in the list view
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.play().catch(() => {});
        } else {
            entry.target.pause();
        }
    });
}, { threshold: 0.25 });

// 1. Load Data
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
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    return video;
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || 'Media';
    img.loading = "lazy";
    return img;
  }
}

// 3. Render Album List
function renderAlbumCards() {
  const list = document.getElementById('album-list');
  const fragment = document.createDocumentFragment();

  albums.forEach((album, index) => {
    const card = document.createElement('div');
    card.className = 'album-card';
    // Add title data-attribute for easy searching
    card.setAttribute('data-title', album.title.toLowerCase());
    card.onclick = () => openAlbum(index);

    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'thumbnail-container';

    const thumbSrc = album.thumbnail || (album.items.length ? album.items[0].src : '');
    const isVideo = thumbSrc.endsWith('.mp4');
    
    const mediaEl = createMediaElement(thumbSrc, isVideo ? 'video' : 'image', album.title);
    
    if (isVideo) {
        mediaEl.autoplay = false;
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

// 4. Search Feature
const searchBar = document.getElementById('searchBar');
searchBar.addEventListener('keyup', (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.album-card');

    cards.forEach(card => {
        const title = card.getAttribute('data-title');
        if (title.includes(term)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// 5. Open Album View
function openAlbum(index) {
  const currentAlbum = albums[index];
  const listSection = document.getElementById('album-list');
  const viewSection = document.getElementById('album-view');
  const searchHeader = document.querySelector('header');
  
  // Hide List & Search, Show View
  listSection.style.display = 'none';
  searchHeader.style.display = 'none'; // Hide search bar inside album
  viewSection.classList.add('visible');
  
  window.scrollTo(0,0);

  document.getElementById('album-title').textContent = currentAlbum.title;

  const narration = document.getElementById('narration');
  if (currentAlbum.narration) {
      narration.src = currentAlbum.narration;
      narration.style.display = 'block';
  } else {
      narration.style.display = 'none';
      narration.pause();
  }

  const container = document.getElementById('media-container');
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  currentAlbum.items.forEach(item => {
    const type = item.type || 'image';
    const el = createMediaElement(item.src, type, currentAlbum.title);
    
    if (type === 'video') {
      el.controls = true;
      el.autoplay = true;
    } else {
        // LIGHTBOX TRIGGER FOR IMAGES
        el.onclick = () => openLightbox(item.src);
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

// 6. Lightbox Logic
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightboxBtn = document.getElementById('closeLightbox');

function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => { lightboxImg.src = ''; }, 200); // Clear after anim
}

// Close on X button or Background click
closeLightboxBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// 7. Back Navigation
function goBack() {
  document.getElementById('album-list').style.display = 'grid';
  document.querySelector('header').style.display = 'block'; // Show search again
  document.getElementById('album-view').classList.remove('visible');

  const narration = document.getElementById('narration');
  narration.pause();
  narration.src = '';
  
  document.getElementById('media-container').innerHTML = '';
}

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', goBack);
});

// 8. Scroll to Top Button
const scrollBtn = document.getElementById("scrollTopBtn");

window.onscroll = function() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollBtn.style.display = "block";
    } else {
        scrollBtn.style.display = "none";
    }
};

scrollBtn.onclick = function() {
    window.scrollTo({top: 0, behavior: 'smooth'});
};
