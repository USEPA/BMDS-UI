import uuid

from django.db import migrations, models

from ...common.utils import random_string
from ..models import get_deletion_date


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Content",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                (
                    "content_type",
                    models.PositiveIntegerField(choices=[(1, "Homepage")], unique=True),
                ),
                ("subject", models.CharField(max_length=128)),
                ("content", models.JSONField()),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("last_updated", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ("-created",)},
        ),
        migrations.CreateModel(
            name="Analysis",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                (
                    "password",
                    models.CharField(
                        default=random_string,
                        editable=False,
                        max_length=12,
                    ),
                ),
                ("inputs", models.JSONField(default=dict)),
                ("outputs", models.JSONField(blank=True, default=dict)),
                ("errors", models.JSONField(blank=True, default=dict)),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("started", models.DateTimeField(blank=True, null=True)),
                ("ended", models.DateTimeField(blank=True, null=True)),
                (
                    "deletion_date",
                    models.DateTimeField(blank=True, default=get_deletion_date, null=True),
                ),
            ],
            options={
                "get_latest_by": ("created",),
                "ordering": ("-created",),
                "verbose_name_plural": "Analyses",
            },
        ),
    ]
