from copy import deepcopy
import bmds
import json
from django.db import models
from django.core.urlresolvers import reverse
from django.utils.timezone import now
import uuid


class Job(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False)
    inputs = models.TextField()
    outputs = models.TextField(
        blank=True)
    errors = models.TextField(
        blank=True)
    created = models.DateTimeField(
        auto_now_add=True)
    started = models.DateTimeField(
        null=True)
    ended = models.DateTimeField(
        null=True)

    def __str__(self):
        return str(self.id)

    def get_absolute_url(self):
        return reverse('job', args=(str(self.id), ))

    def get_input_url(self):
        return reverse('api:job-inputs', args=(str(self.id), ))

    def get_output_url(self):
        return reverse('api:job-outputs', args=(str(self.id), ))

    @property
    def is_finished(self):
        return len(self.outputs) > 0 or len(self.errors) > 0

    @property
    def has_errors(self):
        return len(self.errors) > 0

    @staticmethod
    def build_session(bmds_version, dataset_type, dataset, models):
        # build dataset
        if dataset_type == bmds.constants.CONTINUOUS:
            dataset = bmds.ContinuousDataset(**dataset)
        else:
            dataset = bmds.DichotomousDataset(**dataset)

        # build session
        session = bmds.get_session(bmds_version)(
            dataset_type,
            dataset=dataset
        )

        # by default, use all available models
        if models is None:
            models = session.model_options[dataset_type].keys()
        else:
            models = [d['name'] for d in models]

        # add models to session
        for model_name in models:
            session.add_model(model_name)

        return session

    @staticmethod
    def get_model_output(model):
        output = dict(
            dfile=model.as_dfile()
        )
        if model.output_created:
            output.update(dict(
                outfile=model.outfile,
                output=model.output
            ))
        return output

    def execute(self):

        # set start time
        self.started = now()
        self.save()

        # build bmds sessions
        inputs = json.loads(self.inputs)
        sessions = [
            self.build_session(
                bmds_version=inputs['bmds_version'],
                dataset_type=inputs['dataset_type'],
                dataset=dataset,
                models=inputs.get('models'),
            ) for dataset in inputs['datasets']
        ]

        # execute sessions
        for session in sessions:
            session.execute()

        # build outputs
        outputs = []
        for dataset, session in zip(inputs['datasets'], sessions):
            outputs.append(dict(
                dataset=dataset,
                models=[
                    self.get_model_output(model)
                    for model in session._models
                ]
            ))

        inputs_no_datasets = deepcopy(inputs)
        inputs_no_datasets.pop('datasets')
        obj = dict(
            job_id=str(self.id),
            inputs=inputs_no_datasets,
            outputs=outputs,
        )

        self.outputs = json.dumps(obj)
        self.errors = ''
        self.ended = now()
        self.save()

    def handle_execution_error(self, err):
        self.errors = err
        self.ended = now()
        self.save()
