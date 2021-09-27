import importlib
import os
import pkgutil
from inspect import isclass
from pathlib import Path

from .deployment_runtime_service import DeploymentRuntimeService

package_dir = str(Path(__file__).resolve().parent)
for (_, module_name, _) in pkgutil.iter_modules([package_dir]):
    # import the module and iterate through its attributes
    module = importlib.import_module(f"{__name__}.{module_name}")
    for attribute_name in dir(module):
        attribute = getattr(module, attribute_name)

        if isclass(attribute):
            # Add the class to this package's variables
            globals()[attribute_name] = attribute
