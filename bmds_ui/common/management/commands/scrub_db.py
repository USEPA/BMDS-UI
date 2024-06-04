from textwrap import dedent

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Value
from django.db.models.functions import Concat


class Command(BaseCommand):
    help = """Anonymize user information."""

    def add_arguments(self, parser):
        parser.add_argument(
            "--noinput",
            "--no-input",
            action="store_false",
            dest="interactive",
            default=True,
            help="Do NOT prompt the user for input of any kind.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        interactive = options["interactive"]
        if interactive:
            message = (
                "This will rewrite all users in the database with anonymous data.\n",
                "Are you sure you want to do this?\n\n"
                "Type 'yes' to continue, or 'no' to cancel: ",
            )
            if input("".join(message)) != "yes":
                raise CommandError("Scrubbing user data cancelled.")

        self.update_users()

    def update_users(self):
        # slow; since we're using the same password for everyone... cache it
        hash_password = make_password("pw")

        # save all programs
        get_user_model().objects.update(
            first_name=Concat(Value("first-"), "id"),
            last_name=Concat(Value("last-"), "id"),
            username=Concat(Value("username-"), "id"),
            email=Concat(Value("user-"), "id", Value("@bmdsonline.org")),
            password=hash_password,
        )

        # save superuser
        superuser = (
            get_user_model()
            .objects.filter(is_superuser=True, is_active=True)
            .order_by("id")
            .first()
        )
        superuser.first_name = "Super"
        superuser.last_name = "Duper"
        superuser.email = "admin@bmdsonline.org"
        superuser.username = "admin@bmdsonline.org"
        superuser.password = hash_password
        superuser.save()

        num_users = get_user_model().objects.count()
        message = dedent(
            f"""\
        Rewrite complete!

        - All {num_users} users have fixed names and emails.
        - All {num_users} users have passwords set to `pw`
        - A superuser has the username `admin@bmdsonline.org`
        - A superuser has the password `pw`
        """
        )

        self.stdout.write(self.style.SUCCESS(message))
