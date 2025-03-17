# django-mini-spotify

`django-mini-spotify` is a Django app that provides a simple web-based music player.  
Users can browse and play music tracks.

## Dependencies

This app requires the following Python package:

- [`mutagen`](https://pypi.org/project/mutagen/) (for extracting metadata from audio files)

Install it using pip:

```sh
pip install mutagen
```

## Quick Start

1. Install `mutagen` (if not installed):

   ```sh
   pip install mutagen
   ```

2. Add `mini_spotify` to your `INSTALLED_APPS` in `settings.py`:

   ```python
   INSTALLED_APPS = [
       ...,
       "mini_spotify",
   ]
   ```

3. Include the `mini_spotify` URLconf in your `urls.py`:

   ```python
   path("music/", include("mini_spotify.urls")),
   ```

4. Run migrations:

   ```sh
   python manage.py migrate
   ```

5. Start the development server and visit the admin panel to add music tracks:

   ```sh
   python manage.py runserver
   ```

6. Open [`http://127.0.0.1:8000/music/`](http://127.0.0.1:8000/music/) to browse and play music.