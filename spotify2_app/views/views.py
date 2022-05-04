from django.http import Http404, HttpResponseNotFound
from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, REDIRECT_FIELD_NAME
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages

from social_core.actions import do_complete
from social_django.utils import psa
from social_django.views import _do_login

from ..consts import *
from ..models import *
from ..forms import *
from .api import *
from .view_helpers import *

# Create your views here.

def home(request):
    return render(request, 'home.html')




# Explore page views
def explore(request):
    if request.user.is_authenticated:
        user_playlists_filter = Playlist.objects.filter(user=request.user)

        if (user_playlists_filter.exists()):
            return render(request, 'explore/explore.html', {'playlists': user_playlists_filter.all()})

    return render(request, 'explore/explore.html')




#User activity feed page
def activity(request):
    siteActivity = TrackInteraction.objects.order_by("-interacted_at").all()
    response_data = {'siteActivity': siteActivity,}
    

    if request.user.is_authenticated:
        user_playlists_filter = Playlist.objects.filter(user=request.user)
        following_activity = TrackInteraction.objects.order_by("-interacted_at").filter(user__in=Follower.objects.filter(follower = request.user).values('followee'))
        response_data['following_activity'] = following_activity
        if (user_playlists_filter.exists()):
            response_data['playlists'] = user_playlists_filter.all()

    return render(request, 'activity/activity.html', response_data)


    



# Views relating to user profiles
def user_profile(request, username):
    try:
        user = CustomUser.objects.get(username=username)
        track_likes = TrackInteraction.objects.filter(user=user, disliked=False)
        response_data = {
            'pUser': user,
        }

        if (track_likes.exists()):
            response_data['likes'] = track_likes.all()
        
        if (request.user.is_authenticated):
            user_playlists_filter = Playlist.objects.filter(user=request.user)

            if (user_playlists_filter.exists()):
                response_data['playlists'] = user_playlists_filter.all()

        return render(request, 'profile/user_profile.html', response_data)
    except:
        raise Http404


# Spotify Login Complete override to set cookies to a user logging in with spotify
@never_cache
@csrf_exempt
@psa(f'spotify2_app:complete')
def complete(request, backend, *args, **kwargs):
    """Authentication complete view"""
    print("Do complete override")
    response = do_complete(request.backend, _do_login, user=request.user,
                       redirect_name=REDIRECT_FIELD_NAME, request=request,
                       *args, **kwargs)
    
    try:
        response.set_cookie(key=CONST_RECO_COOKIE_NAME, value=getattr(request.user, CONST_RECO_MODEL_NAME), samesite='Lax', max_age=CONST_COOKIE_DURATION)
    except:
        print("Couldn't set recommendations to cookies!")

    return response


@login_required
def user_settings(request):
    if (request.method == 'POST'):
        print(request.POST)
        if (request.POST.__contains__('username')):
            change_username(request)

        if (request.POST.__contains__('password')):
            change_password(request)

    return render(request, 'profile/user_settings.html')

# Views relating to login functionality

def request_login(request):
    """ if (request.user.is_authenticated):
        return redirect('/') """

    if (request.method == 'POST'):
        print(request.POST)
        form = LoginForm(request, data=request.POST)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)

            print(username, password, user)

            if user is not None:
                login(request, user, CONST_BASE_BACKEND)
                messages.info(request, f"You are now logged in as {username}.")

                response = redirect('/')

                response.set_cookie(key=CONST_RECO_COOKIE_NAME, value=getattr(user, CONST_RECO_MODEL_NAME), samesite='Lax', max_age=CONST_COOKIE_DURATION)
                return response
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid username or password.")
    form = LoginForm()
    return render(request=request, template_name='registration/login.html', context={"login_form":form})

def request_signup(request):
    """ if (request.user.is_authenticated):
        return redirect('/') """

    if(request.method == 'POST'):
        form = SignUpForm(request.POST)

        if form.is_valid():
            user = form.save()
            recommendations = request.COOKIES.get(CONST_RECO_COOKIE_NAME)
            
            login(request, user, CONST_BASE_BACKEND)

            if (is_reco_valid_from_cookies(recommendations)):
                setattr(user, CONST_RECO_MODEL_NAME, recommendations)
                user.save()

            return redirect('/')
    else:
        form = SignUpForm()

    return render(request, 'registration/signup.html', {'form' : form})

# Views relating to discover form

def discover_main(request):
    return render(request, 'discover/discover_main.html')

def discover_form(request):
    form = DiscoverForm()

    response = render(request, 'discover/discover_form.html', {"form": form})
    return response

def discover_recommendations(request):
    return render(request, 'discover/discover_recommendations.html')

    
def playlist(request, playlist_id):
    try:
        playlist = Playlist.objects.get(id=playlist_id)
        owner = CustomUser.objects.filter(id=playlist.user_id).values('username', 'first_name', 'last_name').first()
        playlist_track_filter = PlaylistTrack.objects.filter(playlist=playlist)
        user_playlists_filter = Playlist.objects.filter(user=request.user)
        response_data = {
            'playlist': playlist,
            'owner': owner,
            'track_count': playlist_track_filter.count()
        }

        if (playlist_track_filter.exists()):
            response_data['tracks'] = playlist_track_filter.all()
        
        if (user_playlists_filter.exists()):
            response_data['playlists'] = user_playlists_filter.all()

        return render(request, 'playlist/playlist.html', response_data)
    except:
        raise Http404