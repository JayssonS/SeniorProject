// Check cookies. If not found request from database.
// If neither found, go to form.

determinePageLoad();

function determinePageLoad() {
    console.log("Doing page checks");

    const hasRecommendations = checkCookiesForRecommendations();

    if (hasRecommendations) {
        window.location.replace('/discover/recommendations');
        return;
    }
    window.location.replace('/discover/tailor');
}

function checkCookiesForRecommendations() {
    const recommendations = Cookies.get('songreco');

    if (!recommendations) return false;
    try {
        recommendations.split(':');
        return true;
    } catch (e) {
        Cookies.remove('songreco');
        return false;
    }
}