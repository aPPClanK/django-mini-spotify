from django.shortcuts import redirect, render
from django.urls import reverse
from django.views import generic
from .models import Song
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.db.models import F

def login_page(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect(reverse('mini_spotify:index'))
        else:
            messages.error(request, "Invalid Username/Password")
            return redirect(reverse('mini_spotify:login_page'))
    return render(request, "login.html")

def logout_page(request):
    logout(request)
    return redirect(reverse('mini_spotify:login_page'))

def register_page(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        email = request.POST.get("email")
        
        errors = []
        if User.objects.filter(username=username).exists():
            errors.append("Username already taken!")
        if User.objects.filter(email=email).exists():
            errors.append("Email already taken!")
        if errors:   
            for error in errors:
                messages.info(request, error)
            return redirect('mini_spotify:register_page')
        user = User.objects.create_user(
            username=username,
            email=email
        )
        user.set_password(password)
        user.save() 
        
        messages.info(request, "Account created successfully! You can now log in.")
        return redirect('mini_spotify:register_page')
    return render(request, "register.html")

class IndexView(LoginRequiredMixin, generic.ListView):
    login_url = "login/"
    model = Song
    template_name = "mini_spotify/index.html"
    context_object_name = "songs"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context

def toggle_like(request, song_id):
    if request.method == "POST":
        try:
            song = Song.objects.get(id=song_id)
            user = request.user
            
            if song.likes.filter(id=user.id).exists():
                song.likes.remove(user)
                liked = False
            else:
                song.likes.add(user)
                liked = True
            return JsonResponse({"liked": liked, "liked_count": song.likes.count()})
        except:
            return JsonResponse({"error": "Not found"}, status=404)
    return JsonResponse({"error": "Invalid request"}, status=400)

def update_playcount(request, song_id):
    if request.method == "POST":
        updated = Song.objects.filter(id=song_id).update(playcount=F("playcount") + 1)
        if updated:
            new_playcount = Song.objects.get(id=song_id).playcount
            return JsonResponse({"updated": True, "new_playcount": new_playcount})
        return JsonResponse({"error": "Song not found"}, status=404)
    return JsonResponse({"error": "Invalid request"}, status=400)
