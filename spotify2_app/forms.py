from cProfile import label
from secrets import choice
from django import forms
from .choices import *

class DiscoverForm(forms.Form):
    genre = forms.ChoiceField(choices=GENRE_DISCOVER_CHOICES, widget=forms.RadioSelect)
    artists = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    songs = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)