from re import A
from django.shortcuts import redirect, render
from django.http import Http404, HttpResponseBadRequest, HttpResponse
from django.views.decorators.http import require_GET, require_POST
from django.core import serializers
from .models import *
from .forms import *

import ast
import json

# Spotipy imports
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Spotipy credentials flow setup
SPOTIPY_CLIENT_ID='f5f548e5850e449bacd8396fe552180c'
SPOTIPY_CLIENT_SECRET='cc3e9b6b4c184cbb9d50cf304e2c3686'

# Create your views here.
def test(request):
    form = DiscoverForm(request.POST)

    if form.is_valid():
        print(form.cleaned_data['genre'])
        print(form.cleaned_data['artists'])
    form = DiscoverForm()
    return redirect('/')
    """ else:
        return Http404("Bad Form Input") """

def discover_main(request):
    return render(request, 'discover/discover_main.html')

def discover_form(request):
    form = DiscoverForm()

    return render(request, 'discover/discover_form.html', {"form": form})

def discover_recommendations(request):
    return render(request, 'discover/discover_recommendations.html')

def search_artist(request):
    try:
        keyword = request.POST['keyword']                   # Grab keyword from post
    except:
        return HttpResponseBadRequest()

    if (not keyword or keyword == ''):                      # If the keyword is empty
        return HttpResponseBadRequest()                     # Return a bad request

    if request.method != 'POST':                            # A get request was used.
        return HttpResponseBadRequest()                     # Return a bad request

    sorted_artists = []                                     # To sort set later
    set_artists = set()                                     # Set definition to grab UNIQUE
    map_artists = search_artist_by_keyword(keyword)         # Grab list of artists from query

    if len(map_artists) == 0:                               # If no artists are found
        response = HttpResponse(                            # Create data not found response
            json.dumps({'message': 'No artists found!'}),
            content_type='application/json'
        )
        response.status_code = 204                          # Set status code
        return response

    for list_maps in map_artists:                           # Loop through returned artists
        if len(set_artists) >= 30:
            break
        try:
            for artist in ast.literal_eval(list_maps['artists']):
                if len(set_artists) >= 30:
                    break
                set_artists.add(artist)                     # Add found artist to set
        except:
            continue

    del map_artists                                         # Cleanup map, no longer using

    sorted_artists = sorted(set_artists)                   # Sort set into new list

    del set_artists                                         # Cleanup set, no longer using
    
    return HttpResponse(                                    # Return parsed data
        json.dumps({'artists': sorted_artists}),
        content_type='application/json'
    )

def search_song(request):
    try:
        keyword = request.POST['keyword']                   # Get keyword from post data
    except:
        return HttpResponseBadRequest()

    if (not keyword or keyword == ''):                      # If keyword bad
        return HttpResponseBadRequest()                     # Return bad request

    if (request.method != 'POST'):                          # If not post request
        return HttpResponseBadRequest()                     # Return bad request

    song_data = search_song_by_keyword(keyword)             # List of song results. Limited to 10 results

    if (len(song_data) == 0):
        song_data = query_spotify_song(keyword)

        for obj in song_data['tracks']['items']:
            print(obj['id'])

        """ for obj in serializers.deserialize('json', song_data['tracks']['items']):
            print(obj['id']) """

    if (len(song_data) == 0):
        response = HttpResponse(                            # Create data not found response
            json.dumps({'message': 'No songs found!'}),
            content_type='application/json'
        )
        response.status_code = 204                          # Set status code
        return response

    return HttpResponse(                                    # Return parsed data
        json.dumps({'songs': song_data}),
        content_type='application/json'
    )                                                       # Return queried data

@require_POST
def get_recommendations(request):
    form = DiscoverForm(request.POST)

    try:
        request_artists = request.POST.getlist('artists[]')[:2]     # Grab list of artists. Limit to 2
        request_tracks = request.POST.getlist('tracks[]')[:2]       # Grab list of tracks. Limit to 2
        genres = [request.POST['genre']]                            # Grab selected genre
    except:
        return HttpResponseBadRequest()

    artists = []                                                    # Predefine artist list
    recommendations = []                                            # Predefine recommendation list

    if (len(genres) > 1):                                           # If more than one genre is given
        return HttpResponseBadRequest()

    for artist_name in request_artists:
        artist = Artistdata.objects.filter(                         # Get the first artist matching a string
            name__iexact = artist_name
            ).first()

        if artist is None:                                          # Not found, continue
            continue
        artists.append(artist.id)                                   # Add artist to list of artists

    try:
        recommendations = query_spotify(artists,                    # Populate recommendation list
            genres,
            request_tracks)
    except:
        return HttpResponseBadRequest()                             # API call failed

    if (len(recommendations) == 0):
        response = HttpResponse(                                    # Create data not found response
            json.dumps({'message': 'No songs found!'}),
            content_type='application/json'
        )
        response.status_code = 204                                  # Set status code
        return response

    return HttpResponse(                                            # Return parsed data
        json.dumps({'recommendations': recommendations}),
        content_type='application/json'
    )

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