from django import forms

class SearchForm(forms.Form):
    artist = forms.CharField(widget=forms.TextInput(attrs={'size': '50'}))
    from_year = forms.IntegerField(required=False)
    to_year = forms.IntegerField(required=False)

class GenreForm(forms.Form):

    def __init__(self, list_choice, *args, **kwargs):
        super(GenreForm, self).__init__(*args, **kwargs)

        self.fields['genre'] = forms.ChoiceField(choices = {}, widget=forms.RadioSelect)

    class Meta:
        fiels = ('genre')