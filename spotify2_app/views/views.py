from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib import messages

from ..consts import *
from ..models import *
from ..forms import *
from .api import *
from .view_helpers import *

# Create your views here.

def home(request):
    return render(request, 'base.html')

# Views relating to user profiles
def user_profile(request, username):
    user = CustomUser.objects.get(username=username)

    return render(request, 'profile/user_profile.html', {'pUser': user})

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

                response.set_cookie(key=CONST_RECO_COOKIE_NAME, value=getattr(user, CONST_RECO_MODEL_NAME), samesite='Lax')
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



