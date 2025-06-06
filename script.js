
let albums = [];
let currentAlbum = null;

fetch('./albums.json')
  .then(res => res.json())
  .then(data => {
    albums = data;
    renderAlbumCards();
  });

function renderAlbumCards() {
  const list = document.getElementById('album-list');
  list.innerHTML = '';
  albums.forEach((album, index) => {
    const card = document.createElement('div');
    card.className = 'album-card';

    // Create thumbnail container div
    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'thumbnail-container';

    // Create thumbnail element (video or image)
    let thumbEl;
    if (album.thumbnail && album.thumbnail.endsWith('.mp4')) {
      thumbEl = document.createElement('video');
      thumbEl.src = album.thumbnail;
      thumbEl.autoplay = true;
      thumbEl.loop = true;
      thumbEl.muted = true;
      thumbEl.playsInline = true;
      thumbEl.controls = false;
    } else {
      thumbEl = document.createElement('img');
      thumbEl.src = album.thumbnail || (album.items.length > 0 ? album.items[0].src : '');
      thumbEl.alt = 'Album thumbnail';
    }

    thumbContainer.appendChild(thumbEl);
    card.appendChild(thumbContainer);

    // Create and append title element
    const title = document.createElement('h3');
    title.textContent = album.title;
    card.appendChild(title);

    card.onclick = () => openAlbum(index);
    list.appendChild(card);
  });
}


function openAlbum(index) {
  currentAlbum = albums[index];
  document.getElementById('album-list').classList.add('hidden');
  document.getElementById('album-view').classList.remove('hidden');
  document.getElementById('album-title').textContent = currentAlbum.title;
  document.getElementById('narration').src = currentAlbum.narration;
  const container = document.getElementById('media-container');
  container.innerHTML = '';
  currentAlbum.items.forEach(item => {
    let el;
    if (item.type === 'image') {
      el = document.createElement('img');
      el.src = item.src;
    } else if (item.type === 'video') {
      el = document.createElement('video');
      el.src = item.src;
      el.autoplay = true;
      el.loop = true;
      el.muted = true;
      el.controls = true;
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
  document.getElementById('album-list').classList.remove('hidden');
  document.getElementById('album-view').classList.add('hidden');
}

function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    body.classList.add('light');
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
  }
}
