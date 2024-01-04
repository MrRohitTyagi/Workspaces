import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import "./userSettings.css";

export default function UserSettings() {
  const [value, setValue] = React.useState(0);

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
}

function TabPanel(props) {
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
}

function ProfileSettings() {
  return <div className="profile-settings-container"></div>;
}

function ThemeSelector() {
  return <div className="theme-settings-container"></div>;
}
