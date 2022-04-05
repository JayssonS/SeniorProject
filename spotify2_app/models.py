from email.policy import default
from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class CustomUser(AbstractUser):
    pass
    uid = models.TextField(default='')
    recommendations = models.TextField(default='')

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username

class Musicdata(models.Model):
    id = models.TextField(primary_key=True)
    name = models.TextField()
    album = models.TextField()
    album_id = models.TextField()
    artists = models.TextField()
    artist_ids = models.TextField()
    track_number = models.IntegerField()
    disc_number = models.IntegerField()
    explicit = models.BooleanField()
    danceability = models.FloatField()
    energy = models.FloatField()
    key = models.IntegerField()
    loudness = models.FloatField()
    mode = models.BooleanField()
    speechiness = models.FloatField()
    acousticness = models.FloatField()
    instrumentalness = models.FloatField()
    liveness = models.FloatField()
    valence = models.FloatField()
    tempo = models.FloatField()
    duration_ms = models.IntegerField()
    time_signature = models.IntegerField()
    year = models.IntegerField()
    release_date = models.TextField()

class Artistdata(models.Model):
    id = models.TextField(primary_key=True)
    followers = models.IntegerField()
    genres = models.TextField()
    name = models.TextField()
    popularity = models.IntegerField()