let albums = [];
let currentAlbum = null;

fetch('./albums.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load albums.json');
    return res.json();
  })
  .then(data => {
    albums = data;
    renderAlbumCards();
  })
  .catch(err => {
    console.error(err);
    alert('Error loading albums. Please try again later.');
  });

function createMediaElement(src, type = 'image', alt = '') {
  if (type === 'video') {
    const video = document.createElement('video');
    video.src = src;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.controls = false;
    return video;
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || 'Album thumbnail';
    return img;
  }
}

function renderAlbumCards() {
  const list = document.getElementById('album-list');
  list.innerHTML = '';
  albums.forEach((album, index) => {
    const card = document.createElement('div');
    card.className = 'album-card';

    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'thumbnail-container';

    const thumbType = album.thumbnail && album.thumbnail.endsWith('.mp4') ? 'video' : 'image';
    const thumbSrc = album.thumbnail || (album.items.length > 0 ? album.items[0].src : '');
    const thumbEl = createMediaElement(thumbSrc, thumbType, album.title);

    thumbContainer.appendChild(thumbEl);
    card.appendChild(thumbContainer);

    const title = document.createElement('h3');
    title.textContent = album.title;
    card.appendChild(title);

    card.onclick = () => openAlbum(index);
    list.appendChild(card);
  });
}

function openAlbum(index) {
  currentAlbum = albums[index];
  document.getElementById('album-list').style.display = 'none';
  const albumView = document.getElementById('album-view');
  albumView.classList.add('visible');

  const albumTitle = document.getElementById('album-title');
  albumTitle.textContent = currentAlbum.title;

  const narration = document.getElementById('narration');
  narration.src = currentAlbum.narration || '';
  narration.pause();
  narration.load();

  const container = document.getElementById('media-container');
  container.innerHTML = '';

  currentAlbum.items.forEach(item => {
    const type = item.type || 'image';
    const el = createMediaElement(item.src, type, currentAlbum.title);
    if (type === 'video') {
      el.controls = true;
      el.muted = true;
      el.autoplay = true;
      el.loop = true;
      el.playsInline = true;
    }
    container.appendChild(el);

    if (item.caption) {
      const caption = document.createElement('div');
      caption.className = 'caption';
      caption.textContent = item.caption;
      container.appendChild(caption);
    }
  });
}

function goBack() {
  document.getElementById('album-list').style.display = '';
  const albumView = document.getElementById('album-view');
  albumView.classList.remove('visible');

  const narration = document.getElementById('narration');
  narration.pause();
  narration.src = '';
}

// Attach back button handlers
document.getElementById('backTop').addEventListener('click', goBack);
document.getElementById('backBottom').addEventListener('click', goBack);
