from django.urls import path
from django.conf.urls import url
from . import views

app_name = 'recommender'

urlpatterns = [
    url(r'^$', views.discover, name='discover'),
    url(r'^api/search_artist/$', views.search_artist, name='search_artist'),
    url(r'^api/search_song/$', views.search_song, name='search_song'),
    url(r'^api/get_recommendations/$', views.get_recommendations, name='get_recommendations'),
    path('best/', views.searchform_get, name='best'),
    path('bestp/', views.searchform_post, name='bestp'),\
]
 