const STRING_ID_DISCOVER_CONTAINER = 'div-recommendations';
const STRING_STORAGE_RECOMMENDATIONS = 'songreco';

$(function () {
    function buildRecommendations() {
        console.log("Building recommendations");
        let storage = Cookies.get(STRING_STORAGE_RECOMMENDATIONS);

        if (!storage) {
            window.location.href = '/';
            return;
        }
        let tracks = [];

        try {
            tracks = storage.split(':');
        } catch (e) {
            Cookies.remove(STRING_STORAGE_RECOMMENDATIONS);
            window.location.href = '/';
            return;
        }
        tracks.forEach(x => {
            $(`#${STRING_ID_DISCOVER_CONTAINER}`)
                .append(`
                    <iframe style="border-radius:12px"
                        src="https://open.spotify.com/embed/track/${x}?utm_source=generator"
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