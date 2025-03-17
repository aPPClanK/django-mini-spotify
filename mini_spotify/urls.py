from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
app_name = "mini_spotify"
urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    
    path("login/", views.login_page, name="login_page"),
    path("logout/", views.logout_page, name="logout_page"),
    path("register/", views.register_page, name="register_page"),
    
    path("toggle_like/<int:song_id>/", views.toggle_like, name="toggle_like"),
    path("update_playcount/<int:song_id>/", views.update_playcount, name="update_playcount"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
