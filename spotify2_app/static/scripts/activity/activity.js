const CONST_STRING_DIV_ACTIVITY_CONTAINER = "activity-feed-container";

$(function() {
    createActivityFeed();
});

function createActivityFeed() {

   //loop to generate activity feed posts
    djangoUserInteractions.forEach(x => {
        let span = '<a href="http://localhost:8000/u/'+x.username +'">'+x.username+'</a>';  //add username to the span | links to user's profile page
        let span2 = x.interacted_at
        

       
        if (x.disliked == 'False')  //track like interaction: append like to the span and make the span text green
        {
            
            span += ` liked`   //append liked to user name

            //append user liked span and interaction time span2 to a div in green
            $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`).append(`
            <div id="parent-${x.id}" class="w-full">
                <div class="flex justify-center">
                    <span class = "w-full text-green-600 font-bold hover:underline">${span}</span>
                    <span class = "w-full text-green-600 font-bold">${span2}</span>
                </div>
            </div>
            `);
        } 

        else    //track dislike interaction: append dislike to the span and make the span text red
        {
            span += ` disliked` //append disliked to user name

            //append user disliked span and interaction time span2 to a div in red
            $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`).append(`
            <div id="parent-${x.id}" class="w-full">
                <div class="flex justify-center">
                    <span class = "w-full text-red-600 font-bold hover:underline">${span}</span>
                    <span class = "w-full text-red-600 font-bold">${span2}</span>
                </div>
            </div>
            `);
        }

        
       
        //add track widget element
        createTrackElement(`parent-${x.id}`, x.track_id);
    });
}