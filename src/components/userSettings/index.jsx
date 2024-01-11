/* eslint-disable react/prop-types */
import { memo, useState } from "react";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ColorLensIcon from "@mui/icons-material/ColorLens";

import "./userSettings.css";

const UserSettings = memo(() => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const a11yProps = (index) => {
    return {
      id: `vertical-tab-${index}`,
      "aria-controls": `vertical-tabpanel-${index}`,
    };
  };

  return (
    <div className="user-settings-container">
      <Tabs
        centered
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        <Tab
          label="Account"
          {...a11yProps(0)}
          icon={<ManageAccountsIcon />}
          iconPosition="end"
        />
        <Tab
          label="Theme"
          {...a11yProps(1)}
          icon={<ColorLensIcon />}
          iconPosition="end"
        />
      </Tabs>
      <TabPanel value={value} index={0}>
        <ProfileSettings />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ThemeSelector />
      </TabPanel>
    </div>
  );
});

const TabPanel = memo((props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
});

const ProfileSettings = memo(() => {
  return <div className="profile-settings-container"></div>;
});

const ThemeSelector = memo(() => {
  return <div className="theme-settings-container"></div>;
});
ThemeSelector.displayName = "ThemeSelector";
ProfileSettings.displayName = "ProfileSettings";
TabPanel.displayName = "TabPanel";
UserSettings.displayName = "UserSettings";

export default UserSettings;
