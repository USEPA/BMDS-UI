from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.db.models import TextChoices
from django.utils.html import format_html
from reversion.admin import VersionAdmin

from . import models


class CustomQuerysetsFilter(SimpleListFilter):
    title = "custom"
    parameter_name = "custom"

    class CustomQuerysetChoices(TextChoices):
        MAYBE_HANGING = "hanging"

    def lookups(self, request, model_admin):
        return self.CustomQuerysetChoices.choices

    def queryset(self, request, queryset):
        value = self.value()
        if value == self.CustomQuerysetChoices.MAYBE_HANGING:
            return models.Analysis.maybe_hanging(queryset)


@admin.register(models.Analysis)
class AnalysisAdmin(VersionAdmin):
    list_display = ("__str__", "view_url", "edit_url", "created", "is_finished", "deletion_date")
    readonly_fields = ("password",)
    list_filter = (
        CustomQuerysetsFilter,
        "started",
        "ended",
        "deletion_date",
    )

    @admin.display(description="View")
    def view_url(self, obj):
        return format_html(f"<a href='{obj.get_absolute_url()}'>View</a>")

    @admin.display(description="Edit")
    def edit_url(self, obj):
        return format_html(f"<a href='{obj.get_edit_url()}'>Edit</a>")


@admin.register(models.Content)
class Content(VersionAdmin):
    list_display = ("id", "content_type", "subject", "created", "last_updated")
    list_filter = ("content_type",)


@admin.register(models.Collection)
class CollectionAdmin(VersionAdmin):
    pass
