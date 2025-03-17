from django.contrib.auth.models import User
from django.template.defaultfilters import truncatechars
from django.db import models
from mutagen.mp3 import MP3
import os
# Create your models here.
class Artist(models.Model):
    name = models.CharField(max_length=50, verbose_name="Artist name")
    description = models.TextField(max_length=500)
    photo = models.ImageField(upload_to="artists/")
    def __str__(self):
        return self.name
    @property
    def short_description(self):
        return truncatechars(self.description, 100)

class Album(models.Model):
    name = models.CharField(max_length=100)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    cover = models.ImageField(upload_to="albums/")
    publication_date = models.DateField()
    genre = models.CharField(max_length=50)
    def __str__(self):
        return self.name
class Song(models.Model):
    name = models.CharField(max_length=100)
    file = models.FileField(upload_to="songs/")
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    album = models.ForeignKey(Album, on_delete=models.CASCADE, null=True, blank=True)
    duration = models.PositiveIntegerField(editable=False, null=True, blank=True)
    playcount = models.PositiveSmallIntegerField(default=0)
    publication_date = models.DateField()
    likes = models.ManyToManyField(User, related_name="liked_songs", blank=True)
    def save(self, *args, **kwargs):
        if self.file:
            file_path = self.file.path
            if os.path.exists(file_path):
                audio = MP3(file_path)
                self.duration = int(audio.info.length)
        super().save(*args, **kwargs)
