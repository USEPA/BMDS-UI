from io import StringIO
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = """Dump test database into a fixture."""

    def handle(self, *args, **options):
        if "fixture" not in settings.DATABASES["default"]["NAME"]:
            raise CommandError("Must be using a test database to execute.")

        f = StringIO()
        shared_kwargs = dict(
            format="yaml",
            indent=2,
            stdout=f,
            use_natural_foreign_keys=True,
            use_natural_primary_keys=True,
        )

        call_command("dumpdata", "contenttypes", **shared_kwargs)
        call_command("dumpdata", "auth", **shared_kwargs)
        call_command("dumpdata", "analysis", **shared_kwargs)
        call_command("dumpdata", "reversion", **shared_kwargs)

        Path(settings.TEST_DB_FIXTURE).parent.mkdir(exist_ok=True, parents=True)
        Path(settings.TEST_DB_FIXTURE).write_text(f.getvalue())
