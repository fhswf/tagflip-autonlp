import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  Alert,
  Button,
  Cascader,
  Descriptions,
  Divider,
  Form,
  Modal,
  Tag,
} from 'antd';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { GetDatasetProviders } from '../../../../apollo/__generated__/GetDatasetProviders';
import { GetDatasetsByType } from '../../../../apollo/__generated__/GetDatasetsByType';
import { GetProjectBase } from '../../../../apollo/__generated__/GetProjectBase';
import { UpdateProject } from '../../../../apollo/__generated__/UpdateProject';
import {
  GET_DATASET_PROVIDERS,
  GET_DATASETS_BY_TYPE,
} from '../../../../apollo/datasets';
import { GET_PROJECT_BASE, UPDATE_PROJECT } from '../../../../apollo/projects';
import FormHelp from '../../../../components/form-help';

interface OwnProps {}

type Props = OwnProps;

type CascadeOption = {
  blankLabel: string;
  label: any;
  value: string;
  isLeaf: boolean;
  loading?: boolean;
  children?: CascadeOption[];
};

const layout = {
  labelCol: { span: 4 },
};
const tailLayout = {
  wrapperCol: { offset: 4 },
};

const DataSelection: FunctionComponent<Props> = (props) => {
  let match = useRouteMatch<{ id: string }>('/project/:id/');
  const [options, setOptions] = useState<CascadeOption[]>(null);
  const [selectedProvider, setSelectedProvider] = useState<CascadeOption>(null);
  const [editActive, setEditActive] = useState<boolean>(false);

  const {
    data: projectData,
    loading: projectDataLoading,
    error: projectDataError,
  } = useQuery<GetProjectBase>(GET_PROJECT_BASE, {
    variables: { projectId: match.params.id },
  });
  const [updateProject, { data, loading, error }] = useMutation<UpdateProject>(
    UPDATE_PROJECT,
  );

  const { loading: datasetProvidersLoading } = useQuery<GetDatasetProviders>(
    GET_DATASET_PROVIDERS,
    {
      onCompleted: (datasetProviders) => {
        const result = datasetProviders.datasetProviders.map((x) => ({
          blankLabel: x,
          label: (
            <>
              <Tag color="orange">Provider</Tag> {x}
            </>
          ),
          value: x,
          isLeaf: false,
        }));
        setOptions([...result]);
      },
    },
  );
  const [
    getDatasetsByType,
    { data: datasets, loading: datasetsLoading, error: datasetsError },
  ] = useLazyQuery<GetDatasetsByType>(GET_DATASETS_BY_TYPE, {
    onCompleted: (data) => {
      selectedProvider.loading = false;
      selectedProvider.children = data?.datasetsByType?.map((dataset) => ({
        blankLabel: dataset.name,
        label: (
          <>
            <Tag color="blue">Dataset</Tag> {dataset.name}
          </>
        ),
        value: dataset.id,
        isLeaf: false,
        children: dataset.subsets.map((subset) => ({
          blankLabel: subset.name,
          label: (
            <>
              <Tag color="green">Subset</Tag> {subset.name}
            </>
          ),
          value: subset.id,
          isLeaf: true,
        })),
      }));
      setOptions([...options]);
      setSelectedProvider(null);
    },
  });

  useEffect(() => {
    if (!projectData?.project?.dataset) {
      setEditActive(true);
    } else {
      setEditActive(false);
    }
  }, [projectData?.project?.dataset]);

  const loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    getDatasetsByType({
      variables: {
        datasetProvider: targetOption.value,
        taskType: projectData?.project?.taskType,
      },
    });
    setSelectedProvider(targetOption);
    setOptions([...options]);
  };

  const displayRender = (labels, selectedOptions) => {
    return labels.map((label, i) => {
      const option = selectedOptions[i];
      if (i === labels.length - 1) {
        return (
          <span key={`${option?.value || label}@${i}`}>
            {option?.blankLabel || option?.value || label}{' '}
          </span>
        );
      }
      return (
        <span key={`${option?.value || label}@${i}`}>
          {option?.blankLabel || option?.value || label} /{' '}
        </span>
      );
    });
  };

  const onChange = (value, selectedOptions) => {
    console.log(value, selectedOptions);
  };
  const onFinish = (values) => {
    console.log(values);
    updateProject({
      variables: {
        id: match?.params?.id,
        data: {
          dataset: {
            providerName: values.dataset[0],
            datasetName: values.dataset[1],
            subsetName: values.dataset[2],
          },
        },
      },
    });
  };

  return (
    <>
      <Alert
        message="Data selection (Temporary interface)"
        description="In this view you can select a data set to be used for fine tuning. This view is temporary and will
        be supplemented by flexible data management in the future. Currently, therefore, only selected dataset
        providers are available, including HuggingFace and any manually added external TagFlip instances, from
        which you can select a dataset for the project."
        type="warning"
        showIcon
      />
      <Divider orientation="left">Dataset</Divider>
      {!editActive && (
        <Descriptions
          column={1}
          title="Selected dataset"
          extra={
            <Button
              onClick={() =>
                Modal.confirm({
                  title: 'Changing the dataset may bring unexpected effects!',
                  content:
                    'You are about to change the dataset. Changing the dataset may cause unwanted effects. ' +
                    'For example, already scheduled trainings will use the changed dataset. ' +
                    'Please be sure that you really want to change the dataset.',
                  onOk: () => setEditActive(true),
                })
              }
            >
              Edit
            </Button>
          }
        >
          <Descriptions.Item label="Dataset provider">
            {projectData?.project?.dataset?.providerName}
          </Descriptions.Item>
          <Descriptions.Item label="Dataset">
            {projectData?.project?.dataset?.datasetName}
          </Descriptions.Item>
          <Descriptions.Item label="Subset">
            {projectData?.project?.dataset?.subsetName}
          </Descriptions.Item>
        </Descriptions>
      )}
      {editActive && (
        <Form onFinish={onFinish} {...layout}>
          <FormHelp
            help="Please select a dataset. A dataset belongs to a dataset provider (first cascade). Within a
        dataset (second cascade) can be one or more subsets, from which you have to select one."
          >
            <Form.Item
              name="dataset"
              label="Dataset"
              rules={[{ required: true }]}
            >
              <Cascader
                options={options || []}
                loadData={loadData}
                onChange={onChange}
                displayRender={displayRender}
              />
            </Form.Item>
          </FormHelp>
          <FormHelp help="Don't forget to save">
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Save changes
              </Button>
            </Form.Item>
          </FormHelp>
        </Form>
      )}
    </>
  );
};

export default DataSelection;
