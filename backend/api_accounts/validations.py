from django.http import HttpResponseBadRequest
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.core.validators import validate_slug
from django.core.validators import validate_email as validate_email_django
from django.contrib.auth.password_validation import validate_password as validate_password_django

ModelUser = get_user_model()

def custom_validation(data):
    email = data['email'].strip()
    username = data['username'].strip()
    password = data['password'].strip()

    if not email:
        raise ValidationError('Email is required! Please enter an email address!')
    try:
        validate_email_django(email)
    except ValidationError:
        raise ValidationError('Invalid email address!')
    if ModelUser.objects.filter(email=email).exists():
        raise ValidationError('Email already exists!')
    if not password:
        raise ValidationError('Password is required! Please enter a password!')
    try:
        validate_password_django(password)
    except ValidationError as err:
        raise ValidationError(err.messages)
    # checks is username consists of only alphanumeric characters, hyphens or underscores
    if not username:
        raise ValidationError('Username is required! Please enter a username!')
    try:
        validate_slug(username)
    except ValidationError:
        raise ValidationError('Invalid username!')
    if ModelUser.objects.filter(username=username).exists():
        raise ValidationError('Username already exists!')
    return data

def email_validation(data):
    try:
        email = data['email'].strip()
        if not email:
            raise ValidationError('Email is required! Please enter an email address!')
        return True
    except ValidationError as err:
        return HttpResponseBadRequest(str(err))

def password_validation(data):
    try:
        password = data['password'].strip()
        if not password:
            raise ValidationError('Password is required! Please enter a password!')
        return True
    except ValidationError as err:
        return HttpResponseBadRequest(str(err))

def username_validation(data):
    try:
        username = data['username'].strip()
        if not username:
            raise ValidationError('Username is required! Please enter a username!')
        return True
    except ValidationError as err:
        return HttpResponseBadRequest(str(err))