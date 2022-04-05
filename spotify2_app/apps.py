from django.apps import AppConfig


class Spotify2AppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'spotify2_app'

    def ready(self):
        import spotify2_app.signals
