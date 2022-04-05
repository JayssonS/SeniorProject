from django.urls import path
from django.conf.urls import url
from django.contrib.auth import views as auth_views
from . import views

app_name = 'spotify2_app'

urlpatterns = [
    path('', views.home, name='home'),
    path('discover/', views.discover_main, name='discover'),
    path('discover/recommendations/', views.discover_recommendations, name='discover_recommendations'),
    path('discover/tailor/', views.discover_form, name='discover_form'),
    path('api/search_artist/', views.search_artist, name='search_artist'),
    path('api/search_song/', views.search_song, name='search_song'),
    path('api/get_recommendations/', views.get_recommendations, name='get_recommendations'),
    path('signup/', views.request_signup, name = 'signup'),
    path('login/', views.request_login, name = 'login'),
    path('logout/', auth_views.LogoutView.as_view(), name = 'logout'),
    url(r'^u/(?P<username>\w+)/$', views.user_profile, name='user-profile')
]
 