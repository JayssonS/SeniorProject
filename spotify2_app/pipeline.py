from social_core.exceptions import AuthAlreadyAssociated
from django.contrib.auth import logout

CONST_RECO_COOKIE_NAME = 'songreco'
CONST_RECO_MODEL_NAME = 'recommendations'

def check_user_logged_in(backend, *args, **kwargs):
    request = backend.strategy.request
    user = request.user

def social_user(backend, uid, user=None, *args, **kwargs):
    provider = backend.name
    social = backend.strategy.storage.user.get_social_auth(provider, uid)
    if social:
        if user and social.user != user:
            print(user)
            print(social.user)


            raise AuthAlreadyAssociated(backend)
        elif not user:
            user = social.user
    return {'social': social,
            'user': user,
            'is_new': user is None,
            'new_association': social is None}

def update_logged_in_user_details(backend, user, *args, **kwargs):
    if (backend.name != 'spotify'):
        return

    request = backend.strategy.request
    user = request.user
    user_details = kwargs.get('details')

    if (not user.is_authenticated):
        return
    
    if (user_details is None):
        return

    try:
        setattr(user, 'email', user_details.get('email'))
        setattr(user, 'uid', user_details.get('username'))
        setattr(user, 'first_name', user_details.get('first_name'))
        setattr(user, 'last_name', user_details.get('last_name'))
        user.save()
    except:
        return

def check_existing_user(backend, user, is_new=False, *args, **kwargs):
    print(user)
    print(is_new)

def send_recommendations(backend, user, response, *args, **kwargs):
    print(args)
    print(kwargs)
    #response.set_cookie(key=CONST_RECO_COOKIE_NAME, value=getattr(user, CONST_RECO_MODEL_NAME), samesite='Lax')
