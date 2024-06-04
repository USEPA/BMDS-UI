from django.contrib import admin
from django.contrib.auth import get_user_model
from reversion.admin import VersionAdmin

from .diagnostics import diagnostic_500, diagnostic_cache, diagnostic_celery_task, diagnostic_email

User = get_user_model()
admin.site.unregister(User)


@admin.register(User)
class UserAdmin(VersionAdmin):
    list_display = ("email", "id", "date_joined", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("email",)
    actions = (
        diagnostic_500,
        diagnostic_cache,
        diagnostic_celery_task,
        diagnostic_email,
    )
