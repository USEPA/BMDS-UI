# Run with: python manage.py rotate_passwords

class Command(BaseCommand):
    help = """Rotate all passwords in the database. WARNING: this action is destructive. Proceed with caution."""

    # def add_arguments(self, parser):
    #     parser.add_argument(
    #         "--ifempty",
    #         action="store_true",
    #         dest="ifempty",
    #         help="Only flush/load if database is empty",
    #     )

    def handle(self, *args, **options):
        # db_name = str(settings.DATABASES["default"]["NAME"])
        # if not any(_ in db_name for _ in ["fixture", "test"]):
        #     raise CommandError("Must be using a test database to execute.")

        # call_command("migrate", verbosity=0)

        # if options["ifempty"] and get_user_model().objects.count() > 0:
        #     message = "Migrations complete"
        # else:
        #     self.stdout.write(self.style.HTTP_INFO("Flushing data..."))
        #     call_command("flush", verbosity=0, interactive=False)

        #     self.stdout.write(self.style.HTTP_INFO("Loading database fixture..."))
        #     call_command("loaddata", str(settings.TEST_DB_FIXTURE), verbosity=1)

        #     message = "Migrations complete; fixtures reapplied"

        self.stdout.write("TESTING")