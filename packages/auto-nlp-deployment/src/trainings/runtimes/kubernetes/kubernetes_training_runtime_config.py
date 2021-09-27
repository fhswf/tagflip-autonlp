import os.path
from typing import Any, Literal, Optional

from pydantic import Field

from common.runtimes import RuntimeConfig
from util import get_app_root


class KubernetesTrainingRuntimeConfig(RuntimeConfig[Any]):
    type: Literal["kubernetes"] = "kubernetes"

    job_template_path: Optional[str] = Field(
            os.path.join(get_app_root(), os.path.dirname(os.path.realpath(__file__)), "default-job-template.yaml"),
            description="The job template to be used for generating kubernetes job.")

    repository: Optional[str] = Field(None, description="The docker repository configuration images will be pushed to.")
