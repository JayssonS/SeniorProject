const STRING_ID_DISCOVER_CONTAINER = 'div-recommendations';
const STRING_STORAGE_RECOMMENDATIONS = 'recommendations';

$(function () {
    function buildRecommendations() {
        console.log("Building recommendations");
        let storage = localStorage.getItem(STRING_STORAGE_RECOMMENDATIONS);

        if (!storage) {
            window.location.href = '/discover';
            return;
        }
        let tracks = [];

        try {
            tracks = JSON.parse(storage);
        } catch (e) {
            localStorage.removeItem(STRING_STORAGE_RECOMMENDATIONS);
            window.location.href = '/discover';
            return;
        }
        tracks.forEach(x => {
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
    buildRecommendations();
});