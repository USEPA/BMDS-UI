# BMDS webserver

[![Documentation Status](https://readthedocs.org/projects/bmds-server/badge/?version=master)](https://bmds-server.readthedocs.io/en/master/)

Run a webserver that will batch process dose-response data using the US
EPA\'s benchmark dose modeling software
([BMDS](https://www.epa.gov/bmds)). Under the hood, this web application
uses the [BMDS Python interface](https://pypi.python.org/pypi/bmds).

To use the webserver, specify a new BMDS Job using a input file
formatted like this.

``` javascript
{
    "dataset_type": "D",
    "bmds_version": "BMDS2601",
    "datasets": [
        {
            "doses": [0, 1.96, 5.69, 29.75],
            "ns": [75, 49, 50, 49],
            "incidences": [5, 1, 3, 14]
        },
        {
            "doses": [0, 1.96, 5.69, 29.75],
            "ns": [75, 49, 50, 49],
            "incidences": [0, 0, 11, 27]
        }
    ]
}
```

You\'ll receive a Job ID back, and you can check the website to see when
the job is complete. Then, results can be downloaded. Results include:

-   The dfile created for each model
-   The outfile created for each model
-   The parsed output file for each model
-   A recommended best-fitting model, using guidance from [Wignall et
    al. 2014](https://dx.doi.org/10.1289/ehp.1307539) (optional)

To run your own BMDS webserver, you\'ll need a Windows server.
Deployment steps have been documented using a Windows Server 2012 and
IIS 8.5; it may be possible to run in other environments.