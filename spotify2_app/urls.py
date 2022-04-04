from django.urls import path
from django.conf.urls import url
from django.contrib.auth import views as auth_views
from . import views

app_name = 'spotify2_app'

urlpatterns = [
    url(r'^$', views.discover_main, name='discover'),
    url(r'^discover_recommendations', views.discover_recommendations, name='discover_recommendations'),
    url(r'^discover_form', views.discover_form, name='discover_form'),
    url(r'^api/search_artist/$', views.search_artist, name='search_artist'),
    url(r'^api/search_song/$', views.search_song, name='search_song'),
    url(r'^api/get_recommendations/$', views.get_recommendations, name='get_recommendations'),
    path('signup/', views.request_signup, name = 'signup'),
    path('login/', views.request_login, name = 'login'),
    path('logout/', auth_views.LogoutView.as_view(), name = 'logout'),
]
 