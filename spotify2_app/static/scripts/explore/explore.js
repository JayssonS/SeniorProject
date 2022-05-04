const STRING_ID_USER_STATIC_DIV = 'user-results-placeholder';
const STRING_ID_USER_RESULTS = 'user-results-container';
const STRING_ID_USER_SEARCH = 'user-search-bar';
const STRING_API_USER = 'search_user';
const INT_TYPING_TIMEOUT = 300;
const INT_KEYWORD_MIN_LENGTH = 2;

let typingTimer = null;
let stage = 0;
const stageViews = {
    0: 'song-select-container',
    1: 'user-search-container',
}

$(function() {
    // Handle real-time searching
    $('.search-bar').on('keydown', function () {
        if (typingTimer) {                                  // If a timer exists
            clearTimeout(typingTimer);                      // Clear it
        }
        typingTimer = setTimeout(function () {
            handleSearch();                                 // Set a timer
        }, INT_TYPING_TIMEOUT);
    });
});

function handleSearch() {
    const keyword = $(`.search-bar`).val().trim();
    
    if (keyword === '') {
        $(`#${CONST_STRING_DIV_SEARCH_RESULTS_CONTAINER}`).remove();
        return;
    }
    if (keyword.length < INT_KEYWORD_MIN_LENGTH) return;            // Return if shorter than min length
    console.log("Searching!");                                      // sanity check

    $.ajax({                                                        // Make API call
        url: '/api/search_song/',                                   // API endpoint URL
        type: 'POST',                                               // API request type
        headers: {                                                  // Headers, must include token for valid call
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: { 'keyword': keyword },                               // Data to send to backend
        success: function (json, status, xhr) {                     // Successful call handling
            switch (xhr.status) {
                case 200:
                    handleTrackResults(json);
                    break;
                case 204:
                    handleNoTracks();
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

function userSearch() {
    const keyword = $(`user-search-bar`).val().trim();

    if (keyword.length < INT_KEYWORD_MIN_LENGTH) return;            
    console.log("Searching!");                                      

    $.ajax({                                                        
        url: '/api/search_user/',                                   
        type: 'POST',                                               
        headers: {                                                  
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: { 'keyword': keyword },                               
        success: function (json, status, xhr) {                     
            console.log(keyword)
        },
        error: function (xhr, errmsg, err, json) {                  
            console.log(xhr.status + ": " + xhr.responseText);
        }
    })
}