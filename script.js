const clientId = '4eb6a2f80fd249d7a458cc5ecfb432ee';
const clientSecret = '8370bf7cfd7a4478be82271a592c57d9';

let json;
let tokenMaster;

class App {
  constructor() {}

  async getToken() {
        const bodyAux = new URLSearchParams({
          'grant_type' : 'client_credentials'
          //'scope' : 'user-top-read'
        });

        let response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: bodyAux
        });

        if (response.ok) { 
          json = await response.json();
          this.loadAlbums(json.access_token);
  }
}
  
  _sortAlbums(sortFunction) {
    this.albumInfo.sort(sortFunction);
    this._renderAlbums();
  }
  
  async _renderTracks(opt) {

    json;
    const albumContainer = document.querySelector('#album-container');
    const cover = document.querySelector('#cover');
    albumContainer.innerHTML = '';

    const coverImg = new Image();
    coverImg.src = json.images[0].url;

    document.querySelector('#mainTitle').innerHTML = json.name;
    document.querySelector('#subTitle').innerHTML = 'Playlist Spotify de Thomas Fresco';
    cover.innerHTML = '';
    cover.append(coverImg);

    var pesquisa = document.getElementById('search').value;

    var filtro = document.getElementById('filter').value;

    switch(opt) {
    case 1:
      json.tracks.items = json.tracks.items.sort(function(a, b){
        if (a.track.name < b.track.name) {
          return -1;
        }
        if (a.track.name  > b.track.name) {
          return 1;
        }
        return 0;
    });
    break;
    case 2:
        json.tracks.items.sort(function(a, b){
        if (a.track.name < b.track.name) {
          return 1;
        }
        if (a.track.name  > b.track.name) {
          return -1;
        }
        return 0;
      });
      case 3:
        for (const item of json.tracks.items) {
          if (item.track.name.toUpperCase().includes(pesquisa.toUpperCase()) || item.track.album.artists[0].name.toUpperCase().includes(pesquisa.toUpperCase())) {
            const album = new Album(albumContainer, item.track.album.images[0].url, item.track.name, item.track.album.artists[0].name);
          }
        }
        document.getElementById('search').value = '';
    break;
    case 4:
      for (const item of json.tracks.items) {
        let response = await fetch('https://api.spotify.com/v1/artists/'+item.track.album.artists[0].id,{
          method: 'GET',
          headers: { 'Authorization' : 'Bearer ' + tokenMaster}
        })
        
        let aux = await response.json();

        for (const genre of aux.genres) { 
          if (filtro == genre) {
            const album = new Album(albumContainer, item.track.album.images[0].url, item.track.name, item.track.album.artists[0].name);
          }
        }
      }
      break;
      case 5:
        json.tracks.items = json.tracks.items.sort(function(a, b){
          if (a.track.popularity < b.track.popularity) {
            return -1;
          }
          if (a.track.popularity  > b.track.popularity) {
            return 1;
          }
          return 0;
        });
      break;
      case 6:
        json.tracks.items = json.tracks.items.sort(function(a, b){
          if (b.track.popularity < a.track.popularity) {
            return -1;
          }
          if (b.track.popularity  > a.track.popularity) {
            return 1;
          }
          return 0;
        });
      break;
    default:
    }
    if (opt != 3 && opt != 4) {
    albumContainer.innerHTML = '';
    for (const item of json.tracks.items) {
      const album = new Album(albumContainer, item.track.album.images[0].url, item.track.name, item.track.album.artists[0].name);
    }
  }
  }
  
  async loadAlbums(token) {

    tokenMaster = token;

    let response = await fetch('https://api.spotify.com/v1/playlists/37i9dQZEVXcOGcD9xCq5mA',{
      method: 'GET',
      headers: { 'Authorization' : 'Bearer ' + token}
    })

    json = await response.json();

    var select = document.getElementById('filter');

    for (const item of json.tracks.items) {
    let response2 = await fetch('https://api.spotify.com/v1/artists/'+item.track.album.artists[0].id,{
      method: 'GET',
      headers: { 'Authorization' : 'Bearer ' + token}
    })
    let aux = await response2.json();

    for (const genre of aux.genres) { 
        var option = document.createElement('option');
        option.innerHTML = genre;
        select.append(option);
    }
    }

    this._renderTracks(-1);
  }

}

class Album {
  constructor(albumContainer, imageUrl, title, artist) {

    const image = new Image();
    image.src = imageUrl;

    const titleRef = document.createElement("text");
    titleRef.innerHTML = title;
    titleRef.className = 'title';

    const artistRef = document.createElement("text");
    artistRef.innerHTML = artist;
    artistRef.className = 'artist';

    const divTrack = document.createElement("div");
    divTrack.append(image);
    divTrack.append(titleRef);
    divTrack.append(artistRef);
    divTrack.className = 'track';

    albumContainer.append(divTrack);
  }
}

// script.js
const app = new App();
app.getToken();

document.querySelector('#alfa').addEventListener('click', function handleClick() {
  app._renderTracks(1);
});

document.querySelector('#alfaInv').addEventListener('click', function handleClick() {
  app._renderTracks(2);
});

document.querySelector('#searchButton').addEventListener('click', function handleClick() {
  app._renderTracks(3);
});

document.querySelector('#filterButton').addEventListener('click', function handleClick() {
  app._renderTracks(4);
});

document.querySelector('#rank').addEventListener('click', function handleClick() {
  app._renderTracks(5);
});

document.querySelector('#rankInv').addEventListener('click', function handleClick() {
  app._renderTracks(6);
});