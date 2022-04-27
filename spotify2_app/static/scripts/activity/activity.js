const CONST_STRING_DIV_ACTIVITY_CONTAINER = "activity-feed-container";

$(function() {
    createActivityFeed();
});

function createActivityFeed() {
    djangoUserInteractions.forEach(x => {
        let span = '<a href="http://localhost:8000/u/'+x.username +'">'+x.username+'</a>';

        if (x.disliked == 'False') {
            span += ` liked`
            $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`).append(`
            <div id="parent-${x.id}" class="w-full">
            <span class = "w-full text-green-600 font-bold hover:underline">${span}</span>
            </div>
            `);
        } 
        else 
        {
            span += ` disliked`
            $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`).append(`
            <div id="parent-${x.id}" class="w-full">
            <span class = "w-full text-red-600 font-bold hover:underline">${span}</span>
            </div>
            `);
        }

        
       

        createTrackElement(`parent-${x.id}`, x.track_id);
    });
}