const CONST_STRING_DIV_ACTIVITY_CONTAINER = "activity-global-container";
const CONST_STRING_DIV_ACTIVTY_FOLLOWING_CONTAINER = "activity-feed-following-container"
const CONST_STRING_DIV_ACTIVITY_HEADER = 'activity-input-header';


const CONST_STRING_BTN_SELECT_FOLLOWING_ACTVITY = 'activity-following-feed';
const CONST_STRING_BTN_SELECT_GLOBAL = 'activity-global-feed';

let selectedDiv = null;

$(function() {
    $(`.${CONST_STRING_DIV_ACTIVITY_HEADER}`).on('change', function (event) {
        selectedDiv.addClass('hidden');

        switch (event.target.id) {
            case CONST_STRING_BTN_SELECT_GLOBAL:
                selectedDiv = $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`);
                
                selectedDiv.removeClass('hidden');
                break;
            case CONST_STRING_BTN_SELECT_FOLLOWING_ACTVITY:
                selectedDiv = $(`#${CONST_STRING_DIV_ACTIVTY_FOLLOWING_CONTAINER}`);
                
                if (!selectedDiv.length) {
                    buildFollowingContainer();
                    return;
                }    
                selectedDiv.removeClass('hidden');
                break;
            
            default:
                console.log("Unknown case");
                break;
        }
    });

    selectedDiv = $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`);

    buildGlobalFeed();
});

function buildFollowingContainer() {
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).append(`
        <div id="${CONST_STRING_DIV_ACTIVTY_FOLLOWING_CONTAINER}"
            class="grid grid-cols-1 gap-4 rounded w-full bg-neutral p-5">
        </div>`);
    
    selectedDiv = $(`#${CONST_STRING_DIV_ACTIVTY_FOLLOWING_CONTAINER}`);

    buildFollowingFeed();
}

function buildGlobalFeed() {
    djangoUserInteractions.forEach(x => {
        let span = '<a href="http://localhost:8000/u/'+x.username +'">'+x.username+'</a>';  //add username to the span | links to user's profile page
        let interaction_time_span = x.interacted_at
        

       
        if (x.disliked == 'False')  //track like interaction: append like to the span and make the span text green
        {
            
            span += ` liked`   //append liked to user name

            //append user liked span and interaction time span to a div in green
            $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`).append(`
            <div id="parent-${x.id}" class="w-full border-solid border-2 border-green-600 rounded bg-slate-800">
                <div class="flex justify-center">
                    <span class = "w-full text-green-600 font-bold hover:underline">${span}</span>
                    <span class = "w-full text-neutral-content text-left font-bold">${interaction_time_span}</span>
                </div>
            </div>
            `);
        } 

        else    //track dislike interaction: append dislike to the span and make the span text red
        {
            span += ` disliked` //append disliked to user name

            //append user disliked span and interaction time span to a div in red
            $(`#${CONST_STRING_DIV_ACTIVITY_CONTAINER}`).append(`
            <div id="parent-${x.id}" class="w-full flec items-end border-solid border-2 border-red-600 rounded bg-slate-800">
                <div class="flex justify-center">
                    <span class = "w-full text-red-600 font-bold hover:underline">${span}</span>
                    <span class = "w-full text-neutral-content text-left font-bold ali">${interaction_time_span}</span>
                </div>
            </div>
            `);
        }


        //add track widget element
        createTrackElement(`parent-${x.id}`, x.track_id);
       
    });


}


function buildFollowingFeed() {
    djangoFollowingInteraction.forEach(x => {
        let span = '<a href="http://localhost:8000/u/'+x.username +'">'+x.username+'</a>';  //add username to the span | links to user's profile page
        let interaction_time_span = x.interacted_at
        
        if (x.disliked == 'False')  //track like interaction: append like to the span and make the span text green
        {
            
            span += ` liked`   //append liked to user name
    
            //append user liked span and interaction time span to a div in green
            $(`#${CONST_STRING_DIV_ACTIVTY_FOLLOWING_CONTAINER}`).append(`
            <div id="parent-follow-${x.id}" class="w-full border-solid border-2 border-green-600 rounded bg-slate-800">
                <div class="flex justify-center">
                    <span class = "w-full text-green-600 font-bold hover:underline">${span}</span>
                    <span class = "w-full text-neutral-content text-left font-bold">${interaction_time_span}</span>
                </div>
            </div>
            `);
        } 
        else    //track dislike interaction: append dislike to the span and make the span text red
        {
            span += ` disliked` //append disliked to user name
    
            //append user disliked span and interaction time span to a div in red
            $(`#${CONST_STRING_DIV_ACTIVTY_FOLLOWING_CONTAINER}`).append(`
            <div id="parent-follow-${x.id}" class="w-full flec items-end border-solid border-2 border-red-600 rounded bg-slate-800">
                <div class="flex justify-center">
                    <span class = "w-full text-red-600 font-bold hover:underline">${span}</span>
                    <span class = "w-full text-neutral-content text-left font-bold ali">${interaction_time_span}</span> 
                </div>
            </div>
            `);
        }
        
        //add track widget element
        createTrackElement(`parent-follow-${x.id}`, x.track_id);  
    });

}