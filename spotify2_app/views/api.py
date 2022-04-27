from django.http import HttpResponseBadRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect
from django.core.serializers.json import DjangoJSONEncoder

from ..consts import *
from ..models import *
from ..forms import *
from .api import *
from .view_helpers import *

import ast
import json

# API endpoints

@csrf_exempt
def search_artist(request):
    if (request.method == 'GET'):
        return redirect('/')
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

@csrf_exempt
def search_song(request):
    if (request.method == 'GET'):
        return redirect('/')
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

@csrf_exempt
def interact_track(request):
    if (request.method == 'GET'):
        return redirect('/')

    if (request.user is None):
        print("No user!")
        return HttpResponseBadRequest()

    if (not request.user.is_authenticated):
        print("User not authed")
        return HttpResponseBadRequest()

    try:
        trackId = request.POST['track_id']
        interactFlag = request.POST['interact_flag']
        track_interaction = interact_track_helper(request.user, trackId, bool(int(interactFlag)))

        if (track_interaction == 500):
            return HttpResponseBadRequest()

        response = HttpResponse()
        
        response.status_code = track_interaction
        return response
    except:
        return HttpResponseBadRequest()

@csrf_exempt
def interact_playlist(request):
    if (request.method == 'GET'):
        return redirect('/')

    if (request.user is None):
        print("No user!")
        return HttpResponseBadRequest()

    if (not request.user.is_authenticated):
        print("User not authed")
        return HttpResponseBadRequest()

    playlist_id = request.POST['playlist_id']
    interact_flag = request.POST['interact_flag']
    playlist_interaction = interact_playlist_helper(request.user, playlist_id, bool(int(interact_flag)))

    if (playlist_interaction == 500):
        return HttpResponseBadRequest()

    response = HttpResponse()
    
    response.status_code = playlist_interaction
    return response
@csrf_exempt
def get_recommendations(request):
    if (request.method == 'GET'):
        return redirect('/')
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
    
    save_reco_to_user(request.user, recommendations.get('tracks'))

    return HttpResponse(                                            # Return parsed data
        json.dumps({'recommendations': recommendations}),
        content_type='application/json'
    )

@csrf_exempt
def create_playlist(request):
    if (request.method == 'GET'):
        return redirect('/')
    if (request.user is None):
        return HttpResponseBadRequest()
    if (not request.user.is_authenticated):
        return HttpResponseBadRequest()

    created_playlist = Playlist.objects.create(user=request.user)

    if (created_playlist.id is None):
        return HttpResponseBadRequest()

    user_playlist_query = Playlist.objects.filter(user=request.user)
    new_playlist_filter = Playlist.objects.filter(id=created_playlist.id)
    new_playlist = new_playlist_filter.get()

    new_playlist.name = "My Playlist #" + str(user_playlist_query.all().count())

    new_playlist.save()

    return HttpResponse(                                            # Return parsed data
        json.dumps({'playlist': list(new_playlist_filter.values())}, cls=DjangoJSONEncoder),
        content_type='application/json'
    )

@csrf_exempt
def add_to_playlist(request):
    if (request.method == 'GET'):
        return redirect('/')
    if (request.user is None):
        return HttpResponseBadRequest()
    if (not request.user.is_authenticated):
        return HttpResponseBadRequest()

    print(request.POST)

    try:
        playlist_id = int(request.POST['playlist_id'])
        track_id = request.POST['track_id']
        playlist = Playlist.objects.get(user=request.user, id=playlist_id)
        track = Musicdata.objects.get(id=track_id)

        if (PlaylistTrack.objects.filter(playlist=playlist, track=track).exists()):
            return HttpResponseBadRequest()

        PlaylistTrack.objects.create(track=track, playlist=playlist)
    except:
            return HttpResponseBadRequest()

    response = HttpResponse()
    return response

@csrf_exempt
def get_user_track_dislikes(request):
    if (request.method == 'GET'):
        return redirect('/')

    try:
        userId = request.POST['userId']
        user = CustomUser.objects.get(id=userId)
        track_dislikes = TrackInteraction.objects.filter(user=user, disliked=True)
        
        if (not track_dislikes.exists()):
            response = HttpResponse(
                json.dumps({'message': 'No dislikes found!'}),
                content_type='application/json'
            )
            response.status_code = 204
            return response

        return HttpResponse(                                            # Return parsed data
            json.dumps({'dislikes': list(track_dislikes.values('track'))}),
            content_type='application/json'
        )
    except:
            return HttpResponseBadRequest()

@csrf_exempt
def get_track_interaction(request):
    if (request.method == 'GET'):
        return redirect('/')
    if (request.user is None):
        return HttpResponseBadRequest()
    if (not request.user.is_authenticated):
        return HttpResponseBadRequest()

    try:
        track_id = request.POST['track_id']
        track = Musicdata.objects.get(id=track_id)
        track_interaction_filter = TrackInteraction.objects.filter(user=request.user, track=track)

        if (not track_interaction_filter.exists()):
            return HttpResponseBadRequest()
        
        response = HttpResponse()

        if (track_interaction_filter.get().disliked == 1):
            response.status_code = 204
        
        return response
    except:
        return HttpResponseBadRequest()

@csrf_exempt
def get_playlist_interaction(request):
    if (request.method == 'GET'):
        return redirect('/')
    if (request.user is None):
        return HttpResponseBadRequest()
    if (not request.user.is_authenticated):
        return HttpResponseBadRequest()

    try:
        playlist_id = request.POST['playlist_id']
        playlist = Playlist.objects.get(id=playlist_id)
        playlist_interaction_filter = PlaylistInteraction.objects.filter(user=request.user, playlist=playlist)

        if (not playlist_interaction_filter.exists()):
            return HttpResponseBadRequest()
        
        response = HttpResponse()

        if (playlist_interaction_filter.get().disliked == 1):
            response.status_code = 204
        
        return response
    except:
        return HttpResponseBadRequest()

@csrf_exempt
def get_user_playlists(request):
    if (request.method == 'GET'):
        return redirect('/')

    try:
        user_id = request.POST['userId']
        user = CustomUser.objects.filter(id=user_id).get()
        playlist_filter = Playlist.objects.filter(user=user)
        response = HttpResponse()

        if (not playlist_filter.exists()):
            response.status_code = 204
        else:
            response.content = json.dumps({'playlists': list(playlist_filter.values('id', 'name'))})
            response['Content-Type'] = 'application/json'

        return response
    except:
        return HttpResponseBadRequest()

@csrf_exempt
def follow_user(request):
    if (request.method == 'GET'):
        return redirect('/')
    if (request.user is None):
        return HttpResponseBadRequest()
    if (not request.user.is_authenticated):
        return HttpResponseBadRequest()

    try:
        followee_id = request.POST['followee_id']
        followee_user = CustomUser.objects.filter(id=followee_id)

        if (not followee_user.exists()):
            return HttpResponseBadRequest()

        if (followee_user.get().id == request.user.id):
            return HttpResponseBadRequest()

        follower_filter = Follower.objects.filter(follower=request.user, followee=followee_user.get())
        response = HttpResponse()

        if (follower_filter.exists()):
            follower_filter.delete()
            response.status_code = 204
        else:
            Follower.objects.create(follower=request.user, followee=followee_user.get())

        return response
    except:
        return HttpResponseBadRequest()
    
@csrf_exempt
def get_user_followers(request):
    if (request.method == 'GET'):
        return redirect('/')
        
    try:
        profile_id = request.POST['profile_id']
        profile_user_filter = CustomUser.objects.filter(id=profile_id)

        if (not profile_user_filter.exists()):
            return HttpResponseBadRequest()

        profile_followers = Follower.objects.filter(followee=profile_user_filter.get())
        response = HttpResponse()
        followers = []
        
        if (profile_followers.exists()):
            for follower in profile_followers.all():
                followers.append({
                    'id': follower.follower.id,
                    'username': follower.follower.username,
                    'first_name': follower.follower.first_name,
                    'last_name': follower.follower.last_name,
                })

            response.content = json.dumps({'followers': followers})
            response['Content-Type'] = 'application/json'
        else:
            response.status_code = 204

        return response
    except:
        return HttpResponseBadRequest()