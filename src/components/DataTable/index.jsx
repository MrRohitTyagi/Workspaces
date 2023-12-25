import React, { memo, useCallback, useMemo } from "react";
import "./datatable.css";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import StarIcon from "@mui/icons-material/Star";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import StarBorder from "@mui/icons-material/StarBorder";
import Archived from "@mui/icons-material/SystemUpdateAlt";

import { Button, IconButton } from "@mui/material";
import { deleteEmail } from "../../controllers/emailController";
import { useDispatch, useSelector } from "react-redux";
import { DELETE_EMAIL, setUser } from "../../redux/userReducer/userReducer";
import { emitEvent } from "../../utils/eventemitter";

const DataTable = memo(({ data, columns }) => {
  const dispatch = useDispatch();
  const user = useSelector(({ user }) => user);

  const handleDeleteEmail = useCallback(
    async (id) => {
      await deleteEmail(id, user.email);
      dispatch(setUser(id, DELETE_EMAIL));
      emitEvent("REFRESH_MAINCONT");
    },
    [dispatch, user.email]
  );

  const table = useMaterialReactTable({
    enableRowActions: true,
    // enableRowSelection: true,
    enableRowDragging: true,

    columns: columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => {
      const rowData = row.original;
      return (
        <div className="action-container">
          <IconButton onClick={() => handleDeleteEmail(rowData.id)}>
            <DeleteForeverIcon color="error" className="action-item" />
          </IconButton>
          <IconButton>
            <Archived
              fontSize="small"
              color="warning"
              className="action-item"
            />
          </IconButton>
          {rowData.isStarred ? (
            <IconButton>
              <StarIcon className="action-item" />
            </IconButton>
          ) : (
            <IconButton>
              <StarBorder className="action-item" />
            </IconButton>
          )}
        </div>
      );
    },
  });

  return <MaterialReactTable table={table} columns={columns} />;
});
DataTable.displayName = "DataTable";

export default DataTable;
