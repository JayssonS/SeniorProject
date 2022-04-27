const CONST_STRING_DIV_ACTIVITY_CONTAINER = "activity-feed-container";

$(function() {
    createActivityFeed();
});

function createActivityFeed() {

   
    djangoUserInteractions.forEach(x => {
        let span = '<a href="http://localhost:8000/u/'+x.username +'">'+x.username+'</a>';  //add username to the span

       
        if (x.disliked == 'False')  //track like: append like to the span and make the span text green
        {
            span += ` liked`
            span += '\xa0\xa0\xa0\xa0\xa0 | \xa0\xa0\xa0\xa0\xa0' + x.interacted_at
            $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`).append(`
            <div id="parent-${x.id}" class="w-full">
            <span class = "w-full text-green-600 font-bold hover:underline">${span}</span>
            </div>
            `);
        } 
        else //track dislike: append dislike to the span and make the span text red
        {
            span += ` disliked`
            span += '\xa0\xa0\xa0\xa0\xa0 | \xa0\xa0\xa0\xa0\xa0' + x.interacted_at
            $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`).append(`
            <div id="parent-${x.id}" class="w-full">
            <span class = "w-full text-red-600 font-bold hover:underline">${span}</span>
            </div>
            `);
        }

        
       

        createTrackElement(`parent-${x.id}`, x.track_id);
    });
}