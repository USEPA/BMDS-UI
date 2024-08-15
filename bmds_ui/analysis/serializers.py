from rest_framework import serializers

from . import models, validators


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Collection
        fields = ("id", "bg_color", "name")


class AnalysisSerializer(serializers.ModelSerializer):
    is_executing = serializers.BooleanField(read_only=True)
    is_finished = serializers.BooleanField(read_only=True)
    has_errors = serializers.BooleanField(read_only=True)
    inputs_valid = serializers.BooleanField(read_only=True)
    collections = CollectionSerializer(many=True)
    api_url = serializers.URLField(source="get_api_url", read_only=True)
    excel_url = serializers.URLField(source="get_excel_url", read_only=True)
    word_url = serializers.URLField(source="get_word_url", read_only=True)

    class Meta:
        model = models.Analysis
        fields = (
            "id",
            "inputs",
            "errors",
            "outputs",
            "collections",
            "is_executing",
            "is_finished",
            "has_errors",
            "inputs_valid",
            "api_url",
            "excel_url",
            "word_url",
            "created",
            "started",
            "ended",
            "starred",
        )
        read_only_fields = (
            "id",
            "errors",
            "outputs",
            "collections",
            "is_executing",
            "is_finished",
            "has_errors",
            "inputs_valid",
            "api_url",
            "excel_url",
            "word_url",
            "created",
            "started",
            "ended",
        )

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.start_execute()
        return instance

    def validate_inputs(self, value):
        try:
            validators.validate_input(value)
        except ValueError as err:
            raise serializers.ValidationError("Validation failed") from err
        return value
