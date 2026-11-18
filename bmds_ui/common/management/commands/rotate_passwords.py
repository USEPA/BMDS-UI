# Run with: python manage.py rotate_passwords [--dry-run] [--noinput]

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from bmds_ui.analysis.models import Analysis
from bmds_ui.common.utils import random_string


class Command(BaseCommand):
    help = (
        "Rotate the edit password for every analysis. DESTRUCTIVE: all existing "
        "edit links stop working: view-only links are unchanged. Before running: "
        "deploy the clone fix, back up the database, stop the web app and "
        "background workers, and confirm no tasks are still running."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report how many analyses would be rotated; change nothing.",
        )
        parser.add_argument(
            "--noinput",
            action="store_true",
            help="Skip the confirmation prompt.",
        )

    def handle(self, *args, **options):
        if settings.IS_DESKTOP:
            raise CommandError("Not applicable to BMDS Desktop; edit links are not shared.")

        db_name = settings.DATABASES["default"]["NAME"]
        total = Analysis.objects.count()
        self.stdout.write(f"Database: {db_name}")
        self.stdout.write(f"Analyses to rotate: {total}")

        if options["dry_run"]:
            self.stdout.write(self.style.WARNING("Dry run; no changes made."))
            return

        if total == 0:
            self.stdout.write("Nothing to rotate.")
            return

        if not options["noinput"]:
            answer = input('Type "rotate" to continue: ')
            if answer.strip() != "rotate":
                raise CommandError("Aborted; no changes made.")

        count = 0
        with transaction.atomic():
            for analysis in Analysis.object.select_for_update().iterator(chunk_size=500):
                old_password = analysis.password
                new_password = random_string()
                while new_password == old_password:
                    new_password = random_string()
                analysis.password = new_password
                analysis.save(update_fields=["password"])
                count += 1

        self.stdout.write(self.style.SUCCESS(f"Rotated passwords for {count} analyses."))
