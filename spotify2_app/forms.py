from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms

from spotify2_app.models import CustomUser
from .choices import *

class DiscoverForm(forms.Form):
    genre = forms.ChoiceField(choices=GENRE_DISCOVER_CHOICES, widget=forms.RadioSelect)
    artists = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    songs = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)

class LoginForm(AuthenticationForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'password']

class SignUpForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'password1', 'password2']