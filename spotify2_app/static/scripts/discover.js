// #region varsMultiStep

const STRING_ID_BUTTON_NEXT_GENRE = 'btn-next-genre';
const STRING_ID_BUTTON_NEXT_ARTIST = 'btn-next-artist';
const STRING_ID_BUTTON_PREVIOUS_ARTIST = 'btn-previous-artist';
const STRING_ID_BUTTON_PREVIOUS_SONG = 'btn-previous-song';
const STRING_ID_BUTTON_SUBMIT = 'btn-submit';

let stage = 2;
const stageViews = {
    0: 'artist-search-container',
    1: 'song-search-container',
    2: 'genre-select-container'
}

// #endregion varsMultiStep

// #region varsGeneral

const STRING_ID_DISCOVER_CONTAINER = 'discover-container';
const STRING_ID_TAILOR_CONTAINER = 'discover-tailor-container';
const STRING_ID_LOADING_CONTAINER = 'div-loading-recommendations';
const STRING_CLASS_BUTTON = 'btn-result';
const INT_KEYWORD_MIN_LENGTH = 2;

let typingTimer = null;
let submitted = false;

// #endregion varsGeneral

// #region varsArtist

const STRING_ID_ARTIST_STATIC_DIV = 'artist-results-placeholder';
const STRING_ID_ARTIST_RESULTS = 'artist-results-container';
const STRING_ID_ARTIST_SELECTED = 'artist-results-selected';
const STRING_ID_ARTIST_SEARCH = 'artist-search-bar';
const STRING_CLASS_BTN_SELECTED = 'btn-result-selected';
const STRING_API_ARTIST = 'search_artist';
const INT_TYPING_TIMEOUT = 300;
const INT_MAX_ARTIST_SELECTED = 2;

let setSelectedArtists = new Set();

// #endregion varsArtist

// #region varsSong

const STRING_ID_SONG_STATIC_DIV = 'song-results-placeholder';
const STRING_ID_SONG_RESULTS = 'song-results-container';
const STRING_ID_SONG_SELECTED = 'song-results-selected';
const STIRNG_ID_SONG_SEARCH = 'song-search-bar';
const STRING_CLASS_BTN_SONG_SELECTED = 'btn-song-result-selected';
const STRING_CLASS_SONG_BUTTON = 'btn-song-result';
const STRING_API_SONG = 'search_song';
const INT_MAX_SONG_SELECTED = 2;

let setSelectedSongs = new Set();

// #endregion varsSong

// #region varsGenre

const STRING_ID_GENRE_STATIC_DIV = 'genre-selection-container';
const STRING_CLASS_GENRE_BUTTON = 'div-genre-select';

let selectedGenre = '';
const arrGenres = [
    'Pop',
    'Rap',
    'Hip Hop',
    'R&B',
    'Edm',
    'Rock',
    'Metalcore',
    'Trap',
    'Jazz',
    'Latin',
    'Grunge',
    'Classical',
    'Disco',
    'Reggae',
    'Funk',
    'Soul',
    'Folk',
    'Heavy Metal',
    'Country',
    'Ambient',
    'Dance',
    'Alternative',
    'Sleep',
    'Punk',
    'Emo'
];

// #endregion varsGenre

// #region varsAlert

const STRING_ID_ALERT = 'alert-form-error';
const STRING_ID_ALERT_BUTTON = 'alert-btn-dismiss';
const STRING_ID_ALERT_TEXT = 'alert-text';

const arrAlertErrors = {
    'genre': 'You must select a genre!',
    'artist': 'You must select at least one artist!',
    'song': 'You must select at least one song!'
};

// #endregion varsAlert

$(function () {


    // #region Multistep

    $(`#${STRING_ID_BUTTON_NEXT_ARTIST}`).on('click', function (event) {
        if (setSelectedArtists.size <= 0){                      // Don't allow continuation if no artists are chosen
            showAlert('artist');
            return;
        }
        hideAlert();
        $(`#${stageViews[stage]}`).addClass('hide');            // Add hidden class to current object

        stage = 1;                                              // Set stage statically

        $(`#${stageViews[stage]}`).removeClass('hide');         // Remove hidden class from next view
    });

    $(`#${STRING_ID_BUTTON_NEXT_GENRE}`).on('click', function (event) {
        if (selectedGenre === '') {                             // Prevent continuation without selecting a genre
            showAlert('genre');
            return;
        }
        hideAlert();
        $(`#${stageViews[stage]}`).addClass('hide');            // Add hidden class to current view

        stage = 0;                                              // Set stage statically

        $(`#${stageViews[stage]}`).removeClass('hide');         // Remove hidden class from next view
    });

    $(`#${STRING_ID_BUTTON_PREVIOUS_ARTIST}`).on('click', function (event) {
        hideAlert();
        $(`#${stageViews[stage]}`).addClass('hide');            // Add hidden class to current view

        stage = 2;                                              // Set stage statically

        $(`#${stageViews[stage]}`).removeClass('hide');         // Remove hidden class from next view
    });

    $(`#${STRING_ID_BUTTON_PREVIOUS_SONG}`).on('click', function (event) {
        hideAlert();
        $(`#${stageViews[stage]}`).addClass('hide');            // Add hidden class to current view

        stage = 0;                                              // Set stage statically

        $(`#${stageViews[stage]}`).removeClass('hide');         // Remove hidden class from next view
    });

    // #endregion Multistep

    // #region Generic

    // Submit post on submit
    $('#discover-form').on('submit', function (event) {
        event.preventDefault();
        console.log("form submitted!");                     // sanity check
        console.log(submitted);
        
        if (selectedGenre === '') return;                   // No selected genre, return
        if (setSelectedArtists.size === 0) return;          // No artists selected, return
        if (setSelectedSongs.size === 0) {                  // No songs selected, return
            showAlert('song');
            return;
        }
        if (submitted) return;                              // Don't allow form submittion more than once
        hideAlert();
        console.log("Submitting form!");                    // sanity check
        submitForm();
    });

    // Handle real-time searching
    $('.search-bar').on('keydown', function () {
        if (typingTimer) {                                  // If a timer exists
            clearTimeout(typingTimer);                      // Clear it
        }
        let searchBarId = $(this).attr('id');

        typingTimer = setTimeout(function () {
            handleSearch(searchBarId);                      // Set a timer
        }, INT_TYPING_TIMEOUT);
    });

    function handleSearch(id) {
        const keyword = $(`#${id}`).val().trim();                   // Get the value of the input box and trim whitespace

        if (keyword === '') {
            if (id === STRING_ID_ARTIST_SEARCH) {                   // If id is artist bar
                $(`#${STRING_ID_ARTIST_RESULTS}`).remove();         // Remove the old container
            } else {
                $(`#${STRING_ID_SONG_RESULTS}`).remove();           // Remove the old container
            }
            return;
        }
        if (keyword.length < INT_KEYWORD_MIN_LENGTH) return;        // Return if shorter than min length
        let endpoint = '';

        if (id === STRING_ID_ARTIST_SEARCH) {
            endpoint = STRING_API_ARTIST;
        } else {
            endpoint = STRING_API_SONG;
        }
        search(endpoint, keyword);
    }

    // Handle artist button clicks
    $(`#${STRING_ID_ARTIST_STATIC_DIV}`).on('click', `.${STRING_CLASS_BUTTON}`, function (event) {
        event.preventDefault();                                         // Prevent the button from submitting the form

        let element = $(this);
        let id = element.attr('id');
        let divResults = $(`#${STRING_ID_ARTIST_RESULTS}`);
        let divSelected = $(`#${STRING_ID_ARTIST_SELECTED}`);

        if (setSelectedArtists.has(id)) {
            element.appendTo(divResults);                               // Move to new div
            element.html(`
                ${id} <span class='span-sign'>+</span>
            `);
            element.removeClass(`${STRING_CLASS_BTN_SELECTED}`);        // Remove styling class
            setSelectedArtists.delete(id);                              // Remove from set
            return;
        }
        if (setSelectedArtists.size >= INT_MAX_ARTIST_SELECTED) {       // If max selected artists hit
            return;                                                     // Return
        }
        element.appendTo(divSelected);                                  // Move to new div
        element.html(`
            ${id} <span class='span-sign'>-</span>
        `);
        element.addClass(`${STRING_CLASS_BTN_SELECTED}`);               // Add new styling class
        setSelectedArtists.add(id);                                     // Add to set
    });

    // API Search function
    function search(endpoint, keyword) {
        console.log("Searching!");                                      // sanity check

        $.ajax({                                                        // Make API call
            url: 'api/' + endpoint + '/',                               // API endpoint URL
            type: 'POST',                                               // API request type
            headers: {                                                  // Headers, must include token for valid call
                'X-CSRFToken': getCookie('csrftoken')
            },
            data: { 'keyword': keyword },                               // Data to send to backend
            success: function (json, status, xhr) {                     // Successful call handling
                switch (xhr.status) {
                    case 200:
                        if (endpoint === STRING_API_ARTIST) {
                            updateArtistForm(json);
                        } else {
                            updateSongForm(json);
                        }
                        break;
                    case 204:
                        if (endpoint === STRING_API_ARTIST) {
                            handleNoArtists();
                        } else {
                            handleNoSongs();
                        }
                        break;
                    default:
                        console.log(xhr.status);
                        break;
                }
            },
            error: function (xhr, errmsg, err, json) {                  // Call failure
                console.log(xhr.status + ": " + xhr.responseText);
            }
        })
    };

    function submitForm() {
        console.log("Submitting form!");                                // sanity check

        const arrArtists = Array.from(setSelectedArtists);
        const arrSongs = Array.from(setSelectedSongs);
        submitted = true;
        
        $(`#${STRING_ID_LOADING_CONTAINER}`).removeClass('hide');       // Show loading overlay

        $.ajax({                                                        // Make API call
            url: 'api/get_recommendations/',                            // API endpoint URL
            type: 'POST',                                               // API request type
            headers: {                                                  // Headers, must include token for valid call
                'X-CSRFToken': getCookie('csrftoken')
            },
            data: {                                                     // Data to send to backend
                'artists': arrArtists,
                'tracks': arrSongs,
                'genre': selectedGenre.replace('-', ' ')
            },
            success: function (json, status, xhr) {                     // Successful call handling
                switch (xhr.status) {
                    case 200:
                        buildRecommendations(json);
                        break;
                    case 204:
                        console.log('no recommendations found');
                        break;
                    default:
                        console.log(xhr.status);
                        break;
                }
            },
            error: function (xhr, errmsg, err, json) {                  // Call failure
                console.log(xhr.status + ": " + xhr.responseText);
            }
        })
    }

    // #endregion Generic

    // #region Artists

    // Function to handle no songs in result
    function handleNoArtists() {
        $(`#${STRING_ID_ARTIST_RESULTS}`).remove();             // Remove result container
        
    }

    // Function to handle list building after successful call
    function updateArtistForm(json) {
        const arrArtists = json['artists'];                     // Grab the corresponding list to 'artists' key

        $(`#${STRING_ID_ARTIST_RESULTS}`).remove();             // Remove the old container

        if (arrArtists.length === 0) {                          // If artist array is empty
            console.log("No artists found!");                   // Log
            return;                                             // and return
        }
        $(`#${STRING_ID_ARTIST_STATIC_DIV}`)                    // Build new container containing results
            .append(                                            // Append container
                $('<div>').prop({
                    id: STRING_ID_ARTIST_RESULTS
                })
            );
        for (let i = 0; i < arrArtists.length; i++) {           // For every artist
            $(`#${STRING_ID_ARTIST_RESULTS}`)                   // Append a container
                .append(
                    $('<button>').prop({                        // Including a button
                        class: STRING_CLASS_BUTTON,
                        id: arrArtists[i]
                    })
                        .append(
                            `${arrArtists[i]} <span class='span-sign'>+</span>`
                        )
                );
        }
    }

    // #endregion Artists

    // #region Songs

    // Handle artist button clicks
    $(`#${STRING_ID_SONG_STATIC_DIV}`).on('click', `.${STRING_CLASS_SONG_BUTTON}`, function (event) {
        let element = $(this);                                          // Get element
        let id = element.attr('id');                                    // Get element id
        let text = element.children('.span-sign-song');                 // Get element text
        let divResults = $(`#${STRING_ID_SONG_RESULTS}`);               // Get div containing results
        let divSelected = $(`#${STRING_ID_SONG_SELECTED}`);             // Get div containing selections

        if (setSelectedSongs.has(id)) {
            element.appendTo(divResults);                               // Move to new div
            text.html('+');
            element.removeClass(`${STRING_CLASS_BTN_SONG_SELECTED}`);   // Remove styling class
            setSelectedSongs.delete(id);                                // Remove from set
            return;
        }
        if (setSelectedSongs.size >= INT_MAX_SONG_SELECTED) {           // If max selected artists hit
            console.log("returning... over limit");
            return;                                                     // Return
        }
        element.appendTo(divSelected);                                  // Move to new div
        text.html('-');
        element.addClass(`${STRING_CLASS_BTN_SONG_SELECTED}`);          // Add new styling class
        setSelectedSongs.add(id);                                       // Add to set
    });

    function handleNoSongs() {
        $(`#${STRING_ID_SONG_RESULTS}`).remove();                       // Remove form container
        
    }

    function updateSongForm(json) {
        const arrSongs = json['songs'];                         // Grab the corresponding list to 'songs' key

        $(`#${STRING_ID_SONG_RESULTS}`).remove();               // Remove the old container

        if (arrSongs.length === 0) {                            // If artist array is empty
            console.log("No songs found!");                     // Log
            return;                                             // and return
        }
        $(`#${STRING_ID_SONG_STATIC_DIV}`)                      // Build new container containing results
            .append(                                            // Append container
                $('<div>').prop({
                    id: STRING_ID_SONG_RESULTS,
                    class: "d-flex justify-content-between div-song-results"
                })
            );
        for (let i = 0; i < arrSongs.length; i++) {             // For every artist
            $(`#${STRING_ID_SONG_RESULTS}`)                     // Append a container
                .append(`
                    <div
                        class="d-flex justify-content-between ${STRING_CLASS_SONG_BUTTON}"
                        id=${arrSongs[i]['id']}
                    >
                        <iframe 
                            style="border-radius:12px" 
                            src="https://open.spotify.com/embed/track/${arrSongs[i]['id']}?utm_source=generator" 
                            width="90%"
                            height="80px"
                            frameBorder="0" 
                            allowfullscreen=""
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
                        </iframe>
                        <span
                            class="span-sign-song noselect"
                        >
                            +
                        </span>
                    </div>
                `);
        }
    }

    // #endregion Songs

    // #region Recommendations

    function buildRecommendations(json) {
        $(`#${STRING_ID_TAILOR_CONTAINER}`).remove();

        const tracks = json['recommendations']['tracks'];
        
        $(`#${STRING_ID_DISCOVER_CONTAINER}`)
            .append(`
                <center>
                    <h1>
                        Recommended For You
                    </h1>
                </center>
                </br>
            `);

        tracks.forEach(x => {
            console.log(x['id']);
            $(`#${STRING_ID_DISCOVER_CONTAINER}`)
                .append(`
                    <iframe style="border-radius:12px"
                        src="https://open.spotify.com/embed/track/${x['id']}?utm_source=generator"
                        width="100%"
                        height="380"
                        frameBorder="0"
                        allowfullscreen=""
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
                    </iframe>
                `);
        });
    }

    // #endregion Recommendations

    // #region Genres

    $(`#${STRING_ID_GENRE_STATIC_DIV}`).on('click', `.${STRING_CLASS_GENRE_BUTTON}`, function (event) {
        let element = $(this);                                          // Get element
        let id = element.attr('id');                                    // Get element id

        if (id === selectedGenre) return;                               // Do nothing if clicking same button
        if (selectedGenre !== '') {                                     // If there's a selected genre
            $(`#${selectedGenre}`).removeClass('btn-primary');          // Remove style
            $(`#${selectedGenre}`).addClass('btn-outline-primary');     // Add style
        }
        element.removeClass('btn-outline-primary');                     // Remove style
        element.addClass('btn-primary');                                // Add style

        selectedGenre = id;                                             // Set as selected genre
    });

    function buildGenres() {
        arrGenres.forEach(x => {
            const id = x.replace(' ', '-').toLowerCase();

            $(`#${STRING_ID_GENRE_STATIC_DIV}`)
                .append(`
                    <div
                        class="${STRING_CLASS_GENRE_BUTTON} btn btn-outline-primary"
                        id="${id}"
                        align-text="center"
                    >
                        <p>${x}</p>
                    </div>
                `);
        });
    }

    // #endregion Genres

    // #region Alert

    $(`#${STRING_ID_ALERT_BUTTON}`).on('click', function() {
        hideAlert();
    });

    function showAlert(error) {
        const alert = $(`#${STRING_ID_ALERT}`);
        const alertText = alert.children(`#${STRING_ID_ALERT_TEXT}`);

        alert.animate({
                bottom: '0'
            }, 500);
        alertText.text(arrAlertErrors[error]);
    }

    function hideAlert() {
        $(`#${STRING_ID_ALERT}`)
            .animate({
                bottom: '-20%'
            }, 500);
    }

    // #endregion Alert

    // Function provided by Django team to retrieve the CSRF Token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    buildGenres();
});