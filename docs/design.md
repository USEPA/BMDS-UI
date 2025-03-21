# Design

This documents key design decisions in the implementation of BMDS-UI.

## Schema data migration for analyses

Past analyses are saved into the application database for future retrieval and generation of Word/Excel reports; this is especially useful when running BMDS Desktop locally and a user may want to keep a single database for a particular assessment. Database schema migrations are implemented using the Django migration framework. We do not recommend making edits to saved inputs and outputs in the database using database migrations, instead, it is preferred to use a schema migration at runtime.

Only one version of `pybmds` can be installed at a time, and therefore, we can only execute new analyses using the latest version of the software. However, `pybmds` is also used to generate Word and Excel reports, as well as general manipulation of saved BMD analyses. As pybmds evolves, the saved analyses in the database may not be compatible with the latest version of `pybmds`, which would break functionality for existing analyses.

The version of an analysis is saved in the `outputs.analysis_schema_version` variable. All interactions with incoming analyses are therefore processed in a schema migrator (`analysis.schema.AnalysisMigrator`), with a function design to migrate data of any version to the current version.

A known limitation is that it is not possible to determine the version of an analysis if the output did not successfully succeed; we should attempt to be backwards compatible with failed or unexecuted analyses.

As of 2025, further work should be done to improve the schema migration tooling, but currently, we do not have any backwards incompatible migrations, and therefore it would be better to wait the need arises before implementing further. The framework is in place however to deal with issues moving forward.
