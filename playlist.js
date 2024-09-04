//code is mostly finished, yay


//Client ID from spotify developer dashboard
const clientId = "24eb24c1e5434820898ae1db42130d8a";

//list of features that are checked
checkedFeatures = [];

//url stuff to check if we got data back from spotify
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

//redirect uri for the website, seen spotify dash board
const redirectUri = "http://127.0.0.1:5500/playlist/playlist.html?";

//variable for target song used later on
let targetSong;

//variable for access token
let accessToken = localStorage.getItem('accessToken') || null;

//loads all event listeners on page load
document.addEventListener('DOMContentLoaded', function () {

    //initalizes event listeners
    initializeEventListeners();

    //checks if we have already authenticated then coverts the code to the data
    //currently no way to preserve access token for an hour
    if (code) {

        displayGenerate();
        console.log("running");
        getAccessToken(clientId, code);

    }

});


//all functions below

//hides the auth box
function hideAuth() {
    document.getElementById("box1").style.display = "none";
}
//initailizes event listeners

//displays the generate page where u can select a song
function displayGenerate() {

    var t1 = gsap.timeline({ onComplete: hideAuth });

    document.getElementById("generateContainer").style.display = "flex";

    t1.to(
        '.box1', { x: '1000vw', duration: 1, ease: "sine.out", delay: 1 }
    );

}

//hides the generate page
function hideGen() {

    document.getElementById("generateContainer").style.display = "none";

}

//displays the playlist container
function displayPlaylistContainer() {

    document.getElementById("searchContainer").classList.add('hidden');

    setTimeout(() => {
        document.getElementById("loader").classList.add('visible5');
    }, 500);


}

//initializes event listeners
function initializeEventListeners() {

    //listener for when the spotify auth button is clicked
    document.getElementById("authorize").addEventListener("click", redirectToAuthCodeFlow, false);
    
    //listens whenever the search button is typed on
    document.getElementById("searchInput").addEventListener("input", handleSearch);

    //listener for when the cover is clicked for processing
    document.getElementById("cover").addEventListener("click", displayPlaylistContainer);

    //list of all the features
    const sliders = ['acousticness', 'danceability', 'energy', 'loudness', 'instrumentalness', 'speechiness', 'liveness', 'valence', 'tempo',];

    //adds events listeners in sliders and makes it so they are hidden before being checked
    sliders.forEach(slider => {

        const text = document.querySelector(`.${slider}Text`);

        const sliderWrapper = document.getElementById(`${slider}-slider-wrapper`);

        const input = document.getElementById(slider);

        const valueSpan = document.getElementById(`${slider}Value`);


        //listeners for when the audio features are hovered over
        text.addEventListener('mouseenter', function () {
            showSliders(slider);
        });

        text.addEventListener('mouseleave', function () {
            hideSliders(slider);
        });

        //updates slider value on change
        input.addEventListener('input', function () {
            
            //stores inital value
            const initialValue = input.value;

            //changes number to the value of the sldier
            valueSpan.textContent = this.value;

            //checks when the slider is changed if the slider is in the selected features list
            //if its not it adds
            if (!(checkedFeatures.includes(slider))) {

                checkedFeatures.push(slider);

            }

        });

    })

    const cover = document.getElementById("coverContainer");
    const c = document.getElementById("cover");

    const genDiv = document.getElementById("genDiv");

    cover.addEventListener('mouseenter', () => {
        c.classList.add('coverHover');
        genDiv.classList.add('genVisible');
    });

    cover.addEventListener('mouseleave', () => {
        c.classList.remove('coverHover');
        genDiv.classList.remove('genVisible');
    });

    const gen = Array.from(document.getElementsByClassName("gen"));

    gen.forEach(g => {
        const genText = g.querySelector('.genText');



        console.log(genText);

        g.addEventListener('mouseenter', () => {
            genText.classList.add('showText');
        });

        g.addEventListener('mouseleave', () => {
            genText.classList.remove('showText');
        });

    });

    document.getElementById("genLiked").addEventListener("click", () => showSliderContainer());

    document.getElementById("genRec").addEventListener("click", () => generatePlaylistRec());
}

function showSliderContainer() {

    document.getElementById("sliders").style.display = "flex";

    document.getElementById("sliders").classList.add('visible3');

    document.getElementById("genRec").style.display = "none";

    document.getElementById("likedText").style.innerHTML = "Select range of audio features and press button again";

    document.getElementById("genLiked").removeEventListener("click", () => showSliderContainer());

    document.getElementById("genLiked").addEventListener("click", () => generatePlaylistLiked());


}
//function for showing the sliders animation
function showSliders(feature) {

    document.getElementById(`${feature}-slider-wrapper`).classList.add('visible2');

}

function hideSliders(feature) {

    document.getElementById(`${feature}-slider-wrapper`).classList.remove('visible2');

}

//function called when searching in the text box, only starts search when term is greater than 2
function handleSearch(event) {

    const searchTerm = event.target.value;

    if (searchTerm.length > 2) {

        searchSongs(searchTerm);

    } else {

        clearDropdown();

    }
}

//grabs a 20 long list based on whats typed on search
async function searchSongs(query) {

    const result = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=20`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await result.json();

    displayResults(data.tracks.items);
}

//appends list to dropdown menu
function displayResults(songs) {

    const dropdown = document.getElementById("songDropdown");
    dropdown.innerHTML = "";

    songs.forEach(song => {

        const songDiv = document.createElement("div");

        const img = document.createElement("img");
        img.src = song.album.images[0].url;
        songDiv.appendChild(img);

        songDiv.innerHTML += `${song.name} - ${song.artists[0].name}`;


        songDiv.addEventListener("click", () => selectSong(song));
        dropdown.appendChild(songDiv);

    });
}

//displays generated playlist before creating playlist for the user
async function displayPlaylist(songs) {

    for (let i = 0; i < 49; i += 50) {
        const batch = songs.slice(i, i + 50);
        if (batch.length == 0) {
            break;
        }
        console.log(batch.join(","));
        const result = await fetch(`https://api.spotify.com/v1/tracks?ids=${batch.join(",")}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const data = await result.json();
        songs = data.tracks;

        console.log(songs);

        const container = document.getElementById("playlistContainer");

        songs.forEach(song => {

            const songDiv = document.createElement("div");

            const img = document.createElement("img");
            img.src = song.album.images[0].url;

            songDiv.appendChild(img);

            songDiv.innerHTML += `${song.name} - ${song.artists[0].name}`;

            container.appendChild(songDiv);
        });

    }
}

//function called when song in the dropdown menu is selected
async function selectSong(song) {

    //sets cover and name
    document.getElementById("cover").src = song.album.images[0].url;
    document.getElementById("searchInput").value = `${song.name} - ${song.artists[0].name}`;

    //grabs audio features
    const audioFeatures = await getAudioFeatures(song.id);
    targetSong = audioFeatures;
    console.log(audioFeatures);

    document.getElementById("songContainer").classList.add('visible');

    clearDropdown();
}

//function to create playlist based on selected audio features

async function generatePlaylistRec() {

    document.getElementById("searchContainer").classList.add('hidden');
    

    const targetSongID = await getSong(targetSong.id);

    console.log(targetSongID.artists);

    artists = targetSongID.artists.map(artist => artist.id).join(",");


    
    const result = await fetch(`https://api.spotify.com/v1/recommendations?
        limit=50&seed_tracks=${targetSongID.id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });



    const data = await result.json();



    songs = data.tracks.map(song => song.id);

    console.log(songs);


    //timer to show the playlist container
    setTimeout(() => {
        document.getElementById("playlistContainer").classList.add('visible4');
    }, 500);

    //only grabs first 100 due to api limits
    displayPlaylist(songs);


    songs = songs.map(id => `spotify:track:${id}`);

    const userId = await getUserId(accessToken);

    document.getElementById("addPlaylist").addEventListener("click", () => addTracksToPlaylist(accessToken, songs, userId));

}
async function generatePlaylistLiked() {

    displayPlaylistContainer();


    //creates a json list of audiofeatures and their current slider value
    let filteredSongs = [];

    const ranges = {

        acousticness: parseFloat(document.getElementById("acousticness").value),
        danceability: parseFloat(document.getElementById("danceability").value),
        energy: parseFloat(document.getElementById("energy").value),
        loudness: parseFloat(document.getElementById("loudness").value),
        speechiness: parseFloat(document.getElementById("speechiness").value),
        instrumentalness: parseFloat(document.getElementById("instrumentalness").value),
        liveness: parseFloat(document.getElementById("liveness").value),
        valence: parseFloat(document.getElementById("valence").value),
        tempo: parseFloat(document.getElementById("tempo").value)

    };


    //filters out the checked features
    looper = true;

    offset = 0;

    //loops through all user saved songs and checks if they have the checked features
    while (looper) {

        //grabs user saved songs in batches of 50
        const result = await fetch(`https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` }
        });


        const data = await result.json();
        //seperates out the track ID
        const tracks = data.items.map(item => item.track.id);

        //checks if we have reached the end of saved tracks
        if (tracks.length < 50) {
            looper = false;
        }

        //grabs audio features for the tracks in the batch
        const batch = tracks.slice(0, 50);
        const result2 = await fetch(`https://api.spotify.com/v1/audio-features?ids=${batch.join(",")}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const data2 = await result2.json();

        const audioFeatures = data2.audio_features;

        //checks if the track is within checked features range
        for (let item of audioFeatures) {
            if (compareAudioFeatures(item, targetSong, ranges, checkedFeatures)) {

                filteredSongs.push(item.id);
                //adds track to filtered list
            }
        }

        console.log(offset);
        offset += 50;

    }

    filteredSongs = filteredSongs.slice(0, 100);

    //hides the loading screen
    document.getElementById("loader").classList.remove('visible5');

    //timer to show the playlist container
    setTimeout(() => {
        document.getElementById("playlistContainer").classList.add('visible4');
    }, 500);

    //only grabs first 100 due to api limits
    displayPlaylist(filteredSongs);


    filteredSongs = filteredSongs.map(id => `spotify:track:${id}`);

    const userId = await getUserId(accessToken);

    document.getElementById("addPlaylist").addEventListener("click", () => addTracksToPlaylist(accessToken, filteredSongs, userId));

}

//grabs the users Id
async function getUserId(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    return data.id;
}

//adds tracks to a spotify playlist, also creates the playlist
async function addTracksToPlaylist(accessToken, trackUris, userID) {
    document.getElementById("addPlaylist").innerHTML = "Added to spotify!";
    const playlist = await createPlaylist(accessToken, userID, "My Generated Playlist");
    console.log(playlist);
    const playlistId = playlist.id;

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uris: trackUris
        })
    });
    console.log(response.json());
}

//creates a playlist
async function createPlaylist(accessToken, userId, playlistName) {
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: playlistName,
            public: false
        })
    });
    return await response.json();
}

//compares the audio features to the target song
function compareAudioFeatures(item, targetSong, ranges, checkedFeatures) {
    return checkedFeatures.every(feature =>
        isWithinRange(item[feature], targetSong[feature], ranges[feature])
    );
}

//checks if the audio feature is within the range
function isWithinRange(value, target, range) {
    return value >= target - range && value <= target + range;
}

//clears dropdown menu
function clearDropdown() {
    document.getElementById("songDropdown").innerHTML = "";
}

//grabs audio features for a specific song, only one
async function getAudioFeatures(id) {
    const result = await fetch(`https://api.spotify.com/v1/audio-features/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    return await result.json();
}


//redirection to spotify
async function redirectToAuthCodeFlow() {
    clientID = "24eb24c1e5434820898ae1db42130d8a";
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientID);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri)
    params.append("scope", "user-library-read user-library-modify playlist-modify-public playlist-modify-private");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;

}

//generation shit, idk how it works
function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

//here we get our access token
async function getAccessToken(clientId, code) {

    const verifier = localStorage.getItem("verifier");

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams({ client_id: clientId, grant_type: "authorization_code", code: code, redirect_uri: redirectUri, code_verifier: verifier })
    });

    const { access_token } = await result.json();

    localStorage.setItem("accessToken", access_token);
    accessToken = localStorage.getItem('accessToken');

    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
}


//grabs a json from spotify(currently grabs what song is playing)
async function getSong(id) {
    // change the url here to get different data
    const result = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    data = await result.json();

    return data;

}

