# Deployment

Minimum hardware requirements:

- Linux
- 8 GB RAM (16 GB recommended)
- 2 processors (4-8 recommended)
- 100 GB HD space (SSD preferred)

Software requirements:

- Linux environment
- docker and docker compose
- [fabric](http://www.fabfile.org/) can be used for (semi) automated deployment; please contact us if you'd like to learn more about this approach

## Build and deploy

Build docker containers which can be deployed. These can be pushed to a container registry or
other approaches for sharing with the deployment target:

```bash
# build containers
source venv/bin/activate
make build
docker-compose -f compose/dc-build.yml --project-directory . build
```

To test-deploy the containers on your development computer:

```bash
# go to a new directory
cd ~/dev/temp
mkdir -p bmdsserver-deploy
cd bmdsserver-deploy

# make shared volumes
mkdir -p data/postgres/backups
mkdir -p data/public
mkdir -p data/private
mkdir -p data/nginx

# copy deployment settings
cp ~/dev/bmds-server/compose/nginx/conf/nginx.example.conf ./data/nginx/nginx.conf
cp ~/dev/bmds-server/compose/dc-deploy.yml ./docker-compose.yml
cp ~/dev/bmds-server/compose/example.env ./.env

# start containers, order is important
# ... start the backend services
docker-compose up -d redis postgres
# ... one time filesystem/database changes
docker-compose run --no-deps --rm sync
# ... start applications
docker-compose up -d web workers cron nginx

# view logs
docker-compose logs -f

# should be running, a few example commands for testing
# check static files
curl -I http://127.0.0.1:9000/static/css/site.css
# check django request
curl -I http://127.0.0.1:9000/
docker-compose exec web manage.py createsuperuser
curl -I http://127.0.0.1:9000/a2921323-9711-45f7-9800-13adc4b41291/admin/login/

# shut down containers
docker-compose down
```

The same approach can be done in production, except please harden the deployment :) .

## Configuration

For configurable parameters, we use environment variables which are loaded in the application configuration at runtime.  See the example [configuration file](https://github.com/USEPA/bmds-online-private/blob/main/compose/example.env) for a complete example. Many variables directly map to settings which are commonly used in django; refer to django documentation for these settings. Additional details on application-specific variables are described below:

- `SESSION_DURATION` [int, default 28800 seconds or 8 hours]. The length of a user-session. After this duration is exceeded, the user must login for a new session.
- `AUTH_PROVIDERS` [pipe-separated str of bmds_server.constants.AuthProvider, default "django"]. A list of providers which can be used for authentication. One or more providers can be used and pipe separated.
    - The "django" authentication provider means accounts can be created in bmds_server and passwords are managed in bmds_server
    - The "external" authentication provider assumes an upstream server handles authentication and returns appropriate user metadata for integration via ``/user/login/wam/``.  If used, ``bmds_server.analysis.views.ExternalAuth.get_user_metadata`` requires a custom implementation.
- `LOGOUT_REDIRECT` [str, optional]. URL to redirect to after logout. Defaults to homepage; this may need to be modified with some authentication providers.
- `INCLUDE_ADMIN` [True/False, default True]. If true, the admin is included in the deployment. If false, it's not included. In some deployments, the admin may be deployed separately with additional security.
