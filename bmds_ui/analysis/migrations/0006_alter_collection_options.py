import django.db.models.functions.text
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("analysis", "0005_collection_bg_color"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="collection",
            options={"ordering": (django.db.models.functions.text.Lower("name"), "id")},
        ),
    ]
