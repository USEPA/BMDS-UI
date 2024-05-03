from django import forms

from . import models


class CreateAnalysisForm(forms.ModelForm):
    class Meta:
        model = models.Analysis
        fields: tuple[str, ...] = ()

    def save(self, commit=True):
        self.instance.inputs = self.instance.default_input()
        return super().save(commit=commit)


class CollectionForm(forms.ModelForm):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.fields["name"].widget.attrs["placeholder"] = "Label"
        for field in self.fields.values():
            field.widget.attrs["class"] = "form-control"

    class Meta:
        model = models.Collection
        fields = ("name", "description")
