def check_for_new_user(backend, request, user, details, is_new, *args, **kwargs):
    if (backend.name != 'spotify'):
        return

    if is_new:
        set_new_user_data(request, user, details, args, kwargs)
    else:
        associate_new_user_data(user, details, args, kwargs)

def set_new_user_data(request, user, details, *args, **kwargs):
    print("Setting new user data")

    if (user is None):
        return
    if (details is None):
        return

    try:
        setattr(user, 'uid', details.get('username'))
        setattr(user, 'recommendations', request.COOKIES.get('songreco'))
        user.save()
    except:
        print("Failed writing UID and recommendation data to user: " + user)
        return

def associate_new_user_data( user, details, *args, **kwargs):
    print("Associating new data")

    if (user is None):
        return
    if (details is None):
        return
    
    try:
        setattr(user, 'email', details.get('email'))
        setattr(user, 'uid', details.get('username'))
        setattr(user, 'first_name', details.get('first_name'))
        setattr(user, 'last_name', details.get('last_name'))
        user.save()
    except:
        return