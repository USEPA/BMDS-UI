from django.conf import settings
from django.core.management import call_command
from django.db import migrations


def load_fixture(apps, schema_editor):
    filename = settings.BASE_DIR / "analysis/fixtures/initial_data.json"
    call_command("loaddata", str(filename), app_label="analysis")


class Migration(migrations.Migration):
    initial = True

    dependencies = [("analysis", "0001_initial")]

    operations = [
        migrations.RunPython(load_fixture, reverse_code=migrations.RunPython.noop),
    ]
