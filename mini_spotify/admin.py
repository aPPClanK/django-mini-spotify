from django.contrib import admin
from .models import Artist
from .models import Album
from .models import Song

class ArtistAdmin(admin.ModelAdmin):
    list_display = ["name", "short_description"]
admin.site.register(Artist, ArtistAdmin)

class AlbumAdmin(admin.ModelAdmin):
    list_display = ["name", "artist", "publication_date", "genre"]
admin.site.register(Album, AlbumAdmin)

class SongAdmin(admin.ModelAdmin):
    list_display = ["name", "artist", "album", "playcount", "publication_date"]
admin.site.register(Song, SongAdmin)