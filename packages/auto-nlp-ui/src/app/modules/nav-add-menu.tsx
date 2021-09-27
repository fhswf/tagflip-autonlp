import { DownOutlined, PlusOutlined, ProjectFilled } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import React, { FC, useState } from 'react';
import NewProject from './projects/project/new-project';

interface OwnProps {}

type Props = OwnProps;

export const NavAddMenu: FC<Props> = (props) => {
  const [showNewProject, setShowNewProject] = useState(false);

  const menu = (
    <Menu>
      <Menu.Item
        key="Add Project"
        icon={<ProjectFilled />}
        onClick={() => setShowNewProject(true)}
      >
        Add Project
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <NewProject
        show={showNewProject}
        onClose={() => setShowNewProject(false)}
      />
      <Dropdown overlay={menu} arrow>
        <Button type="primary">
          <PlusOutlined />
          <DownOutlined />
        </Button>
      </Dropdown>
    </>
  );
};
