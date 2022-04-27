const CONST_STRING_DIV_ACTIVITY_CONTAINER = "activity-feed-container";

$(function() {
    createActivityFeed();
});

function createActivityFeed() {
    djangoUserInteractions.forEach(x => {
        let span = x.username;

        if (x.disliked == 'False') {
            span += ` liked`
        } else {
            span += ` disliked`
        }

        $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`).append(`
            <div id="parent-${x.id}" class="w-full">
                <span>${span}</span>
            </div>
        `);

        createTrackElement(`parent-${x.id}`, x.track_id);
    });
}