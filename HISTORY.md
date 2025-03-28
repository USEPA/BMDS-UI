# History

## v25.1

*Released on 2025-XX-XX.*

* Add Nested Dichotomous NCTR Model
* Add Rao-Scott Transformation for summary Nested Dichotomous data
* Add CDF to Word Report for dichotomous bayesian model average
* Add warnings for invalid parameter settings (min, max, initial)
* Improve plotting ranges for BMDs extrapolated beyond the dose range
* Fix bug in Quantal Linear plotting
* Fix bug in Scaled Residual calculations for continuous lognormal distributions
* Remove reporting of burn-in and # of samples for bayesian modeling since pybmds uses the Laplace Approximation

## v24.1

*Released on 2024-11-25.*

* Added BMDS Desktop mode for execution
* Added support for Multitumor modeling
* Added support for Nested Dichotomous modeling
* Added poly-k adjustment for dichotomous datasets
* Minimum `pybmds` version increased to version `24.1`
* Initial release of `bmds-ui`; project was originally forked from [shapiromatron/bmds-server](https://github.com/shapiromatron/bmds-server)
