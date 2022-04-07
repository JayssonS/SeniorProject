from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import update_session_auth_hash

from ..consts import *
from ..models import *
from ..forms import *
from .api import *
from .view_helpers import *

# Spotipy imports
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Helper functions

def search_artist_by_keyword(keyword):
    query = Musicdata.objects.filter(artists__contains = keyword)   # Query artists based on keyword

    return list(query.values('artists'))                            # Return queried data

def search_song_by_keyword(keyword):
    list_results = []                                               # Final list of results
    str_query = 'SELECT id, name FROM spotify2_app_musicdata '
    split_keyword = str.split(keyword)

    for i, word in enumerate(split_keyword):
        if i == 0:
            str_query += "where instr(LOWER(name || ' ' || artists), '" + word + "') "
            continue
        str_query += "and instr(LOWER(name || ' ' || artists), '" + word + "') "
    
    for song in Musicdata.objects.raw(str_query)[:10]:                      # Raw SQL query. Limit to 10 results
        list_results.append({                                               # Append object to list of results
            "id": song.id,
            "name": song.name
        })

    return list_results

def query_spotify_song(keyword):
    auth_manager = SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET)
    sp = spotipy.Spotify(auth_manager=auth_manager)
    songs = sp.search(q=keyword, limit=10, type='track')

    return songs

def query_spotify(artists, genres, tracks):
    auth_manager = SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET)
    sp = spotipy.Spotify(auth_manager=auth_manager)
    recommendations = sp.recommendations(seed_artists=artists, seed_genres=genres, seed_tracks=tracks, limit=10)

    return recommendations

def is_reco_valid_from_cookies(recommendations):
    print(recommendations)
    if (recommendations is None):
        return False
    
    splitRecommendations = recommendations.split(':')
    
    if (splitRecommendations is None or
        len(splitRecommendations) > 10 or
        len(splitRecommendations) < 1):
        return False
    
    return True

def parse_recommendations(recommendations):
    parsed_recommendations = ''

    for i, reco in enumerate(recommendations):
        parsed_recommendations += reco.get('id')

        if i != (len(recommendations) - 1):
            parsed_recommendations += ':'
    
    return parsed_recommendations

def save_reco_to_user(user, recommendations):
    if (user is None):
        return
    if (not user.is_authenticated):
        return
    if (recommendations is None):
        return
    
    parsedRecommendations = parse_recommendations(recommendations)

    if (parsedRecommendations is None):
        return

    setattr(user, CONST_RECO_MODEL_NAME, parsedRecommendations)
    user.save()

def change_username(request):
    request_new_username = request.POST.get('username')

    if (len(request_new_username) <= 4):
        print("invalid username")
        return

    if (not CustomUser.objects.filter(username=request_new_username).exists()):
        request.user.username = request_new_username

        request.user.save()

def change_password(request):
    request_new_pass = request.POST.get('newpassword')
    current_pass = request.user.password
    request_old_pass = request.POST.get('password')

    if ('pbkdf2_sha256' in request.user.password):
        is_pass_correct = check_password(request_old_pass, current_pass)
    
        if (not is_pass_correct):
            print('invalid old password')
            return
        
    try:
        validate_password(request_new_pass, request.user)
    except:
        print("Invalid new password")
        return
    
    new_password = make_password(request_new_pass)
    request.user.password = new_password

    request.user.save()
    update_session_auth_hash(request, request.user)