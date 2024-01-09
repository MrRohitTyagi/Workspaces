/* eslint-disable react/prop-types */
import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { debounce } from "@mui/material/utils";
import { searchEmail } from "@/controllers/emailController";
import { Avatar } from "@mui/material";

export default function AsyncSelect({
  handleOnChange,
  label,
  fetchOptions,
  CustomOption,
}) {
  const [value, setValue] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const getData = React.useMemo(
    () =>
      debounce(async (inputValue = "", callback) => {
        const res = await fetchOptions(inputValue);
        callback(res);
      }, 400),
    [fetchOptions]
  );

  React.useEffect(() => {
    let active = true;
    getData(inputValue, (results) => {
      if (active) {
        setOptions(results);
      }
    });
    return () => {
      active = false;
    };
  }, [inputValue, getData]);

  return (
    <Autocomplete
      sx={{ width: "100%" }}
      getOptionLabel={(option) => option.username || option.email}
      multiple
      filterOptions={(x) => x}
      options={options}
      filterSelectedOptions
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
        handleOnChange(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} fullWidth />
      )}
      renderOption={(props, option) => {
        return (
          <li {...props}>
            <CustomOption data={option} />
          </li>
        );
      }}
    />
  );
}
