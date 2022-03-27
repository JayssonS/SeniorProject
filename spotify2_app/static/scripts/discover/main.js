// Check cookies. If not found request from database.
// If neither found, go to form.

determinePageLoad();

function determinePageLoad() {
    console.log("Doing page checks");

    const hasRecommendations = checkCookiesForRecommendations();

    console.log(hasRecommendations);
    if (hasRecommendations) {
        window.location.replace('/discover_recommendations');
        return;
    }
    window.location.replace('/discover_form');
}

function checkCookiesForRecommendations() {
    const recommendations = localStorage.getItem('recommendations');

    if (!recommendations) return false;
    try {
        JSON.parse(recommendations);
        return true;
    } catch (e) {
        localStorage.removeItem('recommendations');
        return false;
    }
}