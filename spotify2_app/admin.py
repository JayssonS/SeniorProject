from django.contrib import admin
from .models import Artistdata, CustomUser, Musicdata

# Register your models here.

admin.site.register(Musicdata)
admin.site.register(Artistdata)
admin.site.register(CustomUser)