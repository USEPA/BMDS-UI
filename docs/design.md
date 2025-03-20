# Design

This document is created to allow for documentation for key design decisions in the implementation of BMDS-UI.

## Schema data migration for analyses

Past analyses are saved into the application database for future retrieval and manipulation of the analysis.  Database migrations are implemented using standard database migrations in the Django framework.We do not recommend making edits to saved inputs and outputs in the database using database migrations, instead, it is preferred to use a schema migration at runtime.

Only one version of `pybmds` can be installed at a time, and therefore, we can only execute new analyses using the latest version of the software. However, pybmds is also used to generate Word and Excel reports, as well as general manipulation of saved BMD analyses. As pybmds evolves, the saved analyses in the database may not be compatible with the latest version of the pybmds software, which would break functionality for existing analyses.

The current version of an analysis is saved in the `outputs.analysis_schema_version` variable. All interactions with incoming analyses are therefore processed in a schema migrator (`analysis.schema.AnalysisMigrator`), with a function design to migrate from an older version to a new version. When an incoming analysis is received, this migrations script will attempt to update the older version to a new version.

A known limitation is that it is not possible to determine the version of an analysis if the output did not successfully succeed; we should attempt to be backwards compatible with failed or unexecuted analyses.

As of 2025, further work should be done to improve the schema migration tooling, but at this point, as we do not have any backwards incompatible migrations, we believe that that it would be better to wait until issues arise before further implementing. The basic framework is in place however to deal with issues moving forward.
