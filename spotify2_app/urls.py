from django.urls import path
from django.conf.urls import url
from django.contrib.auth import views as auth_views
from .views import views, api

"""URLs module"""
from django.conf import settings
from django.urls import path

from social_core.utils import setting_name

extra = getattr(settings, setting_name('TRAILING_SLASH'), True) and '/' or ''
app_name = 'spotify2_app'

urlpatterns = [
    path(f'social/complete/<str:backend>{extra}', views.complete,
         name='complete'),

    path('', views.home, name='home'),

    # Explore Page
    path('explore/', views.explore, name='explore'),

    # Recommendation form
    path('discover/', views.discover_main, name='discover'),
    path('discover/recommendations/', views.discover_recommendations, name='discover_recommendations'),
    path('discover/tailor/', views.discover_form, name='discover_form'),

        # API endpoints
    path('api/search_artist/', views.search_artist, name='search_artist'),
    path('api/search_song/', views.search_song, name='search_song'),
    path('api/get_recommendations/', views.get_recommendations, name='get_recommendations'),
    path('api/interact_track/', api.interact_track, name='interact_track'),
    path('api/create_playlist/', api.create_playlist, name='create_playlist'),
    path('api/add_to_playlist/', api.add_to_playlist, name='add_to_playlist'),

    # User auth
    path('signup/', views.request_signup, name = 'signup'),
    path('login/', views.request_login, name = 'login'),
    path('logout/', auth_views.LogoutView.as_view(), name = 'logout'),

    # User account related
    url(r'^u/(?P<username>\w+)/$', views.user_profile, name='user_profile'),
    path('settings/', views.user_settings, name = 'settings'),
]
 