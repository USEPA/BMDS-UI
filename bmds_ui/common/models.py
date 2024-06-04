import reversion
from django.contrib.auth import get_user_model

reversion.register(get_user_model(), exclude=("password",))
