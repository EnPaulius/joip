
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
    card.innerHTML = \`
      <img src="\${album.thumbnail || album.items[0].src}" alt="Album thumbnail">
      <h3>\${album.title}</h3>
    \`;
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
