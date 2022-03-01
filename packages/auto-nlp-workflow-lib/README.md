# AutoNLP Workflow Library

This library should be used to build training scripts for TagFlip AutoNLP.

## Description

In order for a training script to be used for training by the application
it must be ensured that script follow a clearly defined behavior with respect to the following
aspects:

- A training script executed by the software must guarantee that, at the end of the training, a trained model is stored in a uniquely defined format in a central, application-global location so that the model can be referenced for deployments. Similarly, any compatible script must store metrics and parameters that occur during training in a uniform manner in a central location
- Any training script that is executed by the software must retrieve the training data from the central dataset interface and use it for model training.

In order to be able to guarantee the described aspects in training scripts,
this software library provides the training scripts with an interface to be followed
and consequently forces the compliance with the behavior expected by the software.

## Deployment

If this library is changed, the docker image `ghcr.io/fhswf/tagflip-autolp-huggingface-pytorch-gpu` needs to be rebuilt:

```shell
cd ../packages/auto-nlp-docker-images/huggingface-pytorch-gpu
docker build -t ghcr.io/fhswf/tagflip-autolp-huggingface-pytorch-gpu:latest .
docker push ghcr.io/fhswf/tagflip-autolp-huggingface-pytorch-gpu
```

## Usage

Currently this library offers two kinds of workflows to be used.

### Custom Workflow with arbitrary ML-Framework

```python
@dataclass
class MyModelArgumentsA:
    my_paramA: str
    ...

@dataclass
class MyModelArgumentsB:
    my_paramB: str
    ...

class SomeSavable(MLflowSavable):
    ...
    def local_artifact_paths(self, autonlp_args: AutoNLPArguments) -> Dict[Name, Path]:
        # return model artifacts

    def log_args(self, autonlp_args: AutoNLPArguments) -> LogArgs:
        # return meta information via instance of LogArgs
        # as required by https://www.mlflow.org/docs/latest/python_api/mlflow.pyfunc.html#mlflow.pyfunc.log_model

    def python_model(self, autonlp_args: AutoNLPArguments) -> PythonModel:
        # return a MLflow Python model
        # as described at https://www.mlflow.org/docs/latest/models.html#custom-python-models


class SomeWorkflow(AutoNLPWorkflow, ABC):
    def __init__(self):
        super().__init__((MyModelArgumentsA, MyModelArgumentsB))

    def train(self, datasets, autonlp_args, args):
        ...
        #train
        return SomeSavable(...)
```

### HuggingFace Workflow for Token Classification

```python
@dataclass
class MyModelArguments:
    my_paramB: str
    ...

class SomeHuggingFaceWorkflow(HuggingFaceWorkflow):

    def __init__(self):
        super().__init__((TrainingArguments, MyModelArguments))

    def train(self, datasets: DatasetDict, autonlp_args: args):
        ...
        label_list = [...] # List of class-labels / possible token classes
        trainer = Trainer(...) # Hugging Face Trainer
        trainer.add_callback(self.get_hf_tagflip_trainer_callback())

        ... # train and select best model

        return HuggingFaceTokenClassificationSavable(trainer, label_list)
```
