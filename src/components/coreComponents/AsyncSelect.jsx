/* eslint-disable react/prop-types */
import { memo, useEffect, useMemo, useState } from "react";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { debounce } from "@mui/material/utils";

const AsyncSelect = memo(
  ({ handleOnChange, label, fetchOptions, CustomOption, filterConfig }) => {
    const [value, setValue] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState([]);

    const getData = useMemo(
      () =>
        debounce(async (inputValue = "", callback) => {
          let res = await fetchOptions(inputValue);
          if (filterConfig) {
            const { key, value } = filterConfig || {};
            res = res.filter((o) => o[key] !== value);
          }
          callback(res);
        }, 400),
      [fetchOptions, filterConfig]
    );

    useEffect(() => {
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
);
AsyncSelect.displayName = "AsyncSelect";
export default AsyncSelect;
