import { Alert, Form, Input, InputNumber, Select, Switch, Tooltip } from 'antd';
import { ParameterDefinition, ScalarType } from 'auto-nlp-shared-js';
import React, { FunctionComponent } from 'react';
import FormHelp from './form-help';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { Rule } from 'antd/lib/form';

interface OwnProps {
  parameter: ParameterDefinition;
  namePrefix?: string[] | string;
  withHelp?: boolean;
}

type Props = OwnProps;

const ParameterFormItem: FunctionComponent<Props> = (props) => {
  const parameter = props.parameter;
  const namePrefix: string[] | undefined = props.namePrefix
    ? !Array.isArray(props.namePrefix)
      ? [props.namePrefix]
      : props.namePrefix
    : undefined;

  let defaultValue = parameter.default;
  let rules: Rule[] = [
    {
      required: !parameter.optional,
    },
  ];

  const renderFormItem = () => {
    const shouldRenderInput = () => {
      const type = typeof defaultValue;
      return (
        (['number', 'string'].includes(type) ||
          ['string', 'int', 'float', 'number'].includes(parameter.type)) &&
        !parameter.choice
      );
    };

    const shouldRenderSwitch = () => {
      const type = typeof defaultValue;
      return type === 'boolean' || ['boolean'].includes(parameter.type);
    };

    const shouldRenderSelection = () => {
      return parameter.choice;
    };

    const selectComponent = () => {
      if (parameter.regex) {
        rules.push({
          pattern: new RegExp(parameter.regex),
          message: (
            <Tooltip
              placement="bottom"
              title={`Expectation: ${parameter.regex}`}
            >{`Value for parameter '${
              parameter.readableName || parameter.name
            }' doesn't match valid pattern.`}</Tooltip>
          ),
        });
        return <Input />;
      }

      if (parameter.range) {
        rules.push({
          type: 'number',
          min: parameter.range[0],
          max: parameter.range[1],
        });
        defaultValue = parameter.range[0];
        return <InputNumber style={{ width: '100%' }} />;
      }

      if (shouldRenderInput()) {
        return (
          <Input
            placeholder={`Define value for ${parameter.name}`}
            type={typeof defaultValue}
          />
        );
      } else if (shouldRenderSwitch()) {
        return (
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
          />
        );
      } else if (shouldRenderSelection()) {
        return (
          <Select allowClear>
            {parameter.choice.map((x, index) => (
              // @ts-ignore
              <Select.Option key={x} value={x}>
                {x}
              </Select.Option>
            ))}
          </Select>
        );
      }
      return (
        <Alert
          type="error"
          message={`Cannot render parameter ${parameter.name}`}
        />
      );
    };
    const component = selectComponent();
    return (
      <Form.Item
        initialValue={defaultValue}
        name={namePrefix ? [...namePrefix, parameter.name] : parameter.name}
        label={parameter.readableName || parameter.name}
        rules={rules}
      >
        {component}
      </Form.Item>
    );
  };

  if (props.withHelp) {
    return (
      <FormHelp help={parameter.description || 'No description available.'}>
        {renderFormItem()}
      </FormHelp>
    );
  }
  return renderFormItem();
};

export default ParameterFormItem;
